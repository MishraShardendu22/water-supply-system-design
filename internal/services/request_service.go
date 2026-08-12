package services

import (
	"context"
	"time"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type RequestService struct {
	reqRepo         *repositories.RequestRepository
	personRepo      *repositories.PersonRepository
	locRepo         *repositories.LocationRepository
	driverRepo      *repositories.DriverRepository
	vehicleRepo     *repositories.VehicleRepository
	fsRepo          *repositories.FillingStationRepository
	priorityService *PriorityService
	otpService      *OTPService
}

func NewRequestService(
	reqRepo *repositories.RequestRepository,
	personRepo *repositories.PersonRepository,
	locRepo *repositories.LocationRepository,
	driverRepo *repositories.DriverRepository,
	vehicleRepo *repositories.VehicleRepository,
	fsRepo *repositories.FillingStationRepository,
	priorityService *PriorityService,
	otpService *OTPService,
) *RequestService {
	return &RequestService{
		reqRepo:         reqRepo,
		personRepo:      personRepo,
		locRepo:         locRepo,
		driverRepo:      driverRepo,
		vehicleRepo:     vehicleRepo,
		fsRepo:          fsRepo,
		priorityService: priorityService,
		otpService:      otpService,
	}
}

type CreateRequestInput struct {
	RequestType       string  `json:"requestType"` // Letter, Call, Online, Offline
	RequesterID       string  `json:"requesterId"`
	DropOffLocationID string  `json:"dropOffLocationId"`
	FillingStationID  *string `json:"fillingStationId"`
}

func (s *RequestService) CreateRequest(ctx context.Context, input CreateRequestInput) (*models.Request, error) {
	if input.RequesterID == "" || input.DropOffLocationID == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "requesterId and dropOffLocationId are required")
	}

	reqType := models.RequestTypeOnline
	if input.RequestType != "" {
		reqType = input.RequestType
	}

	requester, err := s.personRepo.GetPersonByID(ctx, input.RequesterID)
	if err != nil {
		return nil, err
	}
	if requester == nil {
		return nil, utils.NewAppError(404, "REQUESTER_NOT_FOUND", "Requester person not found")
	}

	dropOff, err := s.locRepo.GetDropOffLocationByID(ctx, input.DropOffLocationID)
	if err != nil {
		return nil, err
	}
	if dropOff == nil {
		return nil, utils.NewAppError(404, "DROP_OFF_LOCATION_NOT_FOUND", "Drop-off location not found")
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	req := &models.Request{
		ID:                id,
		RequestType:       reqType,
		RequesterID:       input.RequesterID,
		DropOffLocationID: input.DropOffLocationID,
		FillingStationID:  input.FillingStationID,
		Status:            models.RequestStatusPending,
		PriorityScore:     0.0,
		CreatedAt:         time.Now(),
		Requester:         requester,
		DropOffLocation:   dropOff,
	}

	// Calculate initial priority score
	pResult, err := s.priorityService.CalculatePriority(ctx, req)
	if err == nil && pResult != nil {
		req.PriorityScore = pResult.PriorityScore
	}

	if err := s.reqRepo.CreateRequest(ctx, req); err != nil {
		return nil, err
	}

	return req, nil
}

func (s *RequestService) GetRequestByID(ctx context.Context, id string) (*models.Request, error) {
	req, err := s.reqRepo.GetRequestByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req == nil {
		return nil, utils.NewAppError(404, "REQUEST_NOT_FOUND", "Request not found")
	}
	return req, nil
}

func (s *RequestService) ListRequests(ctx context.Context, statusFilter string) ([]*models.Request, error) {
	return s.reqRepo.ListRequests(ctx, statusFilter)
}

func (s *RequestService) CalculatePriority(ctx context.Context, id string) (*models.PriorityCalculationResult, error) {
	req, err := s.GetRequestByID(ctx, id)
	if err != nil {
		return nil, err
	}

	result, err := s.priorityService.CalculatePriority(ctx, req)
	if err != nil {
		return nil, err
	}

	newStatus := req.Status
	if req.Status == models.RequestStatusPending {
		newStatus = models.RequestStatusVerified
	}

	if err := s.reqRepo.UpdateRequestPriority(ctx, id, result.PriorityScore, newStatus); err != nil {
		return nil, err
	}

	return result, nil
}

func (s *RequestService) GetRequestStatus(ctx context.Context, id string) (map[string]interface{}, error) {
	req, err := s.GetRequestByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"requestId":     req.ID,
		"status":        req.Status,
		"priorityScore": req.PriorityScore,
		"createdAt":     req.CreatedAt,
		"dispatchedAt":  req.DispatchedAt,
		"completedAt":   req.CompletedAt,
	}, nil
}

type AssignRequestInput struct {
	DriverID         string `json:"driverId"`
	VehicleID        string `json:"vehicleId"`
	FillingStationID string `json:"fillingStationId"`
}

func (s *RequestService) AssignRequest(ctx context.Context, id string, input AssignRequestInput) (*models.Request, error) {
	if input.DriverID == "" || input.VehicleID == "" || input.FillingStationID == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "driverId, vehicleId, and fillingStationId are required")
	}

	req, err := s.GetRequestByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Status != models.RequestStatusPending && req.Status != models.RequestStatusVerified {
		return nil, utils.NewAppError(400, "INVALID_STATE", "Request can only be assigned from PENDING or VERIFIED state")
	}

	driver, err := s.driverRepo.GetDriverByID(ctx, input.DriverID)
	if err != nil {
		return nil, err
	}
	if driver == nil {
		return nil, utils.NewAppError(404, "DRIVER_NOT_FOUND", "Driver not found")
	}
	if driver.Status != models.DriverStatusAvailable {
		return nil, utils.NewAppError(409, "DRIVER_NOT_AVAILABLE", "Selected driver is not available")
	}

	vehicle, err := s.vehicleRepo.GetVehicleByID(ctx, input.VehicleID)
	if err != nil {
		return nil, err
	}
	if vehicle == nil {
		return nil, utils.NewAppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found")
	}
	if vehicle.Status != models.VehicleStatusAvailable {
		return nil, utils.NewAppError(409, "VEHICLE_NOT_AVAILABLE", "Selected vehicle is not available")
	}

	station, err := s.fsRepo.GetFillingStationByID(ctx, input.FillingStationID)
	if err != nil {
		return nil, err
	}
	if station == nil {
		return nil, utils.NewAppError(404, "FILLING_STATION_NOT_FOUND", "Filling station not found")
	}

	// Update Request
	if err := s.reqRepo.AssignRequest(ctx, id, input.DriverID, input.VehicleID, input.FillingStationID); err != nil {
		return nil, err
	}

	// Reserve Driver and Vehicle
	_ = s.driverRepo.UpdateDriverStatus(ctx, input.DriverID, models.DriverStatusOnDelivery)
	_ = s.vehicleRepo.UpdateVehicleStatus(ctx, input.VehicleID, models.VehicleStatusOnDelivery)
	_ = s.fsRepo.IncrementTruckCount(ctx, input.FillingStationID)

	return s.GetRequestByID(ctx, id)
}

func (s *RequestService) DispatchRequest(ctx context.Context, id string) (*models.Request, error) {
	req, err := s.GetRequestByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Status != models.RequestStatusAssigned {
		return nil, utils.NewAppError(400, "INVALID_STATE", "Request can only be dispatched from ASSIGNED state")
	}

	now := time.Now()
	if err := s.reqRepo.DispatchRequest(ctx, id, now); err != nil {
		return nil, err
	}

	return s.GetRequestByID(ctx, id)
}

func (s *RequestService) GenerateOTP(ctx context.Context, id string) (*OTPResponse, error) {
	return s.otpService.GenerateOTP(ctx, id)
}

type CompleteRequestInput struct {
	OTP string `json:"otp"`
}

func (s *RequestService) CompleteRequest(ctx context.Context, id string, input CompleteRequestInput) (*models.Request, error) {
	if input.OTP == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "OTP is required to complete request")
	}

	req, err := s.GetRequestByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Status != models.RequestStatusDispatched {
		return nil, utils.NewAppError(400, "INVALID_STATE", "Request can only be completed from DISPATCHED state")
	}

	// Verify OTP
	if err := s.otpService.VerifyOTP(req, input.OTP); err != nil {
		return nil, err
	}

	now := time.Now()
	if err := s.reqRepo.CompleteRequest(ctx, id, now); err != nil {
		return nil, err
	}

	// Free resources
	if req.DriverID != nil {
		_ = s.driverRepo.IncrementDriverDeliveries(ctx, *req.DriverID)
	}
	if req.VehicleID != nil {
		_ = s.vehicleRepo.UpdateVehicleStatus(ctx, *req.VehicleID, models.VehicleStatusAvailable)
	}
	if req.FillingStationID != nil {
		_ = s.fsRepo.DecrementTruckCount(ctx, *req.FillingStationID)
	}

	return s.GetRequestByID(ctx, id)
}

func (s *RequestService) CancelRequest(ctx context.Context, id string) (*models.Request, error) {
	req, err := s.GetRequestByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Status == models.RequestStatusCompleted || req.Status == models.RequestStatusCancelled {
		return nil, utils.NewAppError(400, "INVALID_STATE", "Request is already completed or cancelled")
	}

	if err := s.reqRepo.CancelRequest(ctx, id); err != nil {
		return nil, err
	}

	// Free driver & vehicle if they were assigned
	if req.DriverID != nil {
		_ = s.driverRepo.UpdateDriverStatus(ctx, *req.DriverID, models.DriverStatusAvailable)
	}
	if req.VehicleID != nil {
		_ = s.vehicleRepo.UpdateVehicleStatus(ctx, *req.VehicleID, models.VehicleStatusAvailable)
	}
	if req.FillingStationID != nil {
		_ = s.fsRepo.DecrementTruckCount(ctx, *req.FillingStationID)
	}

	return s.GetRequestByID(ctx, id)
}

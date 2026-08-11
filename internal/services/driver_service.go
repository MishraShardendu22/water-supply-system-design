package services

import (
	"context"
	"time"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type DriverService struct {
	driverRepo *repositories.DriverRepository
	reqRepo    *repositories.RequestRepository
}

func NewDriverService(driverRepo *repositories.DriverRepository, reqRepo *repositories.RequestRepository) *DriverService {
	return &DriverService{
		driverRepo: driverRepo,
		reqRepo:    reqRepo,
	}
}

type CreateDriverInput struct {
	Name          string `json:"name"`
	ContactNumber string `json:"contactNumber"`
	PhoneType     string `json:"phoneType"` // Basic or Smart
}

func (s *DriverService) CreateDriver(ctx context.Context, input CreateDriverInput) (*models.Driver, error) {
	if input.Name == "" || input.ContactNumber == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Name and contact number are required")
	}

	phoneType := models.PhoneTypeBasic
	if input.PhoneType == models.PhoneTypeSmart {
		phoneType = models.PhoneTypeSmart
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	driver := &models.Driver{
		ID:              id,
		Name:            input.Name,
		ContactNumber:   input.ContactNumber,
		PhoneType:       phoneType,
		TotalRating:     5.0,
		TotalDeliveries: 0,
		Status:          models.DriverStatusAvailable,
		CreatedAt:       time.Now(),
	}

	if err := s.driverRepo.CreateDriver(ctx, driver); err != nil {
		return nil, err
	}

	return driver, nil
}

func (s *DriverService) GetDriverByID(ctx context.Context, id string) (*models.Driver, error) {
	driver, err := s.driverRepo.GetDriverByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if driver == nil {
		return nil, utils.NewAppError(404, "DRIVER_NOT_FOUND", "Driver not found")
	}
	return driver, nil
}

func (s *DriverService) ListDrivers(ctx context.Context) ([]*models.Driver, error) {
	return s.driverRepo.ListDrivers(ctx)
}

func (s *DriverService) GetRecommendedDrivers(ctx context.Context, dropOffLocationID string) ([]*models.DriverRecommendation, error) {
	if dropOffLocationID == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "dropOffLocationId query parameter is required")
	}
	return s.driverRepo.GetRecommendedDrivers(ctx, dropOffLocationID)
}

func (s *DriverService) GetDriverRequests(ctx context.Context, driverID string) ([]*models.Request, error) {
	if _, err := s.GetDriverByID(ctx, driverID); err != nil {
		return nil, err
	}
	return s.reqRepo.GetRequestsByDriverID(ctx, driverID)
}

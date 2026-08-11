package services

import (
	"context"
	"time"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type VehicleService struct {
	vehicleRepo *repositories.VehicleRepository
}

func NewVehicleService(vehicleRepo *repositories.VehicleRepository) *VehicleService {
	return &VehicleService{
		vehicleRepo: vehicleRepo,
	}
}

type CreateVehicleInput struct {
	Type              string  `json:"type"` // Contracted or Municipal
	Capacity          int     `json:"capacity"`
	CurrentLocationID *string `json:"currentLocationId"`
	AssignedDriverID  *string `json:"assignedDriverId"`
}

func (s *VehicleService) CreateVehicle(ctx context.Context, input CreateVehicleInput) (*models.Vehicle, error) {
	if input.Type == "" || input.Capacity <= 0 {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Vehicle type and capacity (> 0) are required")
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	v := &models.Vehicle{
		ID:                id,
		Type:              input.Type,
		Capacity:          input.Capacity,
		CurrentLocationID: input.CurrentLocationID,
		Status:            models.VehicleStatusAvailable,
		AssignedDriverID:  input.AssignedDriverID,
		CreatedAt:         time.Now(),
	}

	if err := s.vehicleRepo.CreateVehicle(ctx, v); err != nil {
		return nil, err
	}

	return v, nil
}

func (s *VehicleService) GetVehicleByID(ctx context.Context, id string) (*models.Vehicle, error) {
	v, err := s.vehicleRepo.GetVehicleByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if v == nil {
		return nil, utils.NewAppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found")
	}
	return v, nil
}

func (s *VehicleService) ListVehicles(ctx context.Context) ([]*models.Vehicle, error) {
	return s.vehicleRepo.ListVehicles(ctx)
}

func (s *VehicleService) GetAvailableVehicles(ctx context.Context) ([]*models.Vehicle, error) {
	return s.vehicleRepo.GetAvailableVehicles(ctx)
}

func (s *VehicleService) UpdateVehicleStatus(ctx context.Context, id string, status string) (*models.Vehicle, error) {
	v, err := s.GetVehicleByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if status != models.VehicleStatusAvailable && status != models.VehicleStatusOnDelivery && status != models.VehicleStatusMaintenance {
		return nil, utils.NewAppError(400, "INVALID_STATUS", "Invalid vehicle status provided")
	}

	if err := s.vehicleRepo.UpdateVehicleStatus(ctx, id, status); err != nil {
		return nil, err
	}

	v.Status = status
	return v, nil
}

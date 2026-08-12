package services

import (
	"context"
	"time"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type LocationService struct {
	locRepo    *repositories.LocationRepository
	driverRepo *repositories.DriverRepository
}

func NewLocationService(locRepo *repositories.LocationRepository, driverRepo *repositories.DriverRepository) *LocationService {
	return &LocationService{
		locRepo:    locRepo,
		driverRepo: driverRepo,
	}
}

type CreateDropOffLocationInput struct {
	Address            string  `json:"address"`
	Latitude           float64 `json:"latitude"`
	Longitude          float64 `json:"longitude"`
	Landmark           *string `json:"landmark"`
	HasPrivateBorewell bool    `json:"hasPrivateBorewell"`
	TrafficRisk        string  `json:"trafficRisk"` // Low, Medium, High
	NormalTravelTime   int     `json:"normalTravelTime"`
	IsSchoolOrHospital bool    `json:"isSchoolOrHospital"`
}

func (s *LocationService) CreateDropOffLocation(ctx context.Context, input CreateDropOffLocationInput) (*models.DropOffLocation, error) {
	if input.Address == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Address is required")
	}

	trafficRisk := models.TrafficRiskLow
	if input.TrafficRisk == models.TrafficRiskMedium || input.TrafficRisk == models.TrafficRiskHigh {
		trafficRisk = input.TrafficRisk
	}

	locID, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	loc := &models.Location{
		ID:        locID,
		Address:   input.Address,
		Latitude:  input.Latitude,
		Longitude: input.Longitude,
		Landmark:  input.Landmark,
		CreatedAt: time.Now(),
	}

	if err := s.locRepo.CreateLocation(ctx, loc); err != nil {
		return nil, err
	}

	dropOff := &models.DropOffLocation{
		ID:                 locID,
		HasPrivateBorewell: input.HasPrivateBorewell,
		TrafficRisk:        trafficRisk,
		NormalTravelTime:   input.NormalTravelTime,
		IsSchoolOrHospital: input.IsSchoolOrHospital,
		CreatedAt:          time.Now(),
		Location:           loc,
	}

	if err := s.locRepo.CreateDropOffLocation(ctx, dropOff); err != nil {
		return nil, err
	}

	return dropOff, nil
}

func (s *LocationService) GetDropOffLocationByID(ctx context.Context, id string) (*models.DropOffLocation, error) {
	dropOff, err := s.locRepo.GetDropOffLocationByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if dropOff == nil {
		return nil, utils.NewAppError(404, "DROP_OFF_LOCATION_NOT_FOUND", "Drop-off location not found")
	}
	return dropOff, nil
}

func (s *LocationService) ListDropOffLocations(ctx context.Context) ([]*models.DropOffLocation, error) {
	return s.locRepo.ListDropOffLocations(ctx)
}

func (s *LocationService) GetDriversForDropOffLocation(ctx context.Context, dropOffLocationID string) ([]*models.DriverRecommendation, error) {
	if _, err := s.GetDropOffLocationByID(ctx, dropOffLocationID); err != nil {
		return nil, err
	}
	return s.driverRepo.GetRecommendedDrivers(ctx, dropOffLocationID)
}

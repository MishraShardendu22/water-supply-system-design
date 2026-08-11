package services

import (
	"context"
	"time"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type FillingStationService struct {
	fsRepo  *repositories.FillingStationRepository
	locRepo *repositories.LocationRepository
}

func NewFillingStationService(fsRepo *repositories.FillingStationRepository, locRepo *repositories.LocationRepository) *FillingStationService {
	return &FillingStationService{
		fsRepo:  fsRepo,
		locRepo: locRepo,
	}
}

type CreateFillingStationInput struct {
	Name       string `json:"name"`
	LocationID string `json:"locationId"`
}

func (s *FillingStationService) CreateFillingStation(ctx context.Context, input CreateFillingStationInput) (*models.FillingStation, error) {
	if input.Name == "" || input.LocationID == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Name and locationId are required")
	}

	loc, err := s.locRepo.GetLocationByID(ctx, input.LocationID)
	if err != nil {
		return nil, err
	}
	if loc == nil {
		return nil, utils.NewAppError(404, "LOCATION_NOT_FOUND", "Associated location not found")
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	station := &models.FillingStation{
		ID:                id,
		Name:              input.Name,
		LocationID:        input.LocationID,
		CurrentTruckCount: 0,
		Availability:      models.StationStatusAvailable,
		CreatedAt:         time.Now(),
		Location:          loc,
	}

	if err := s.fsRepo.CreateFillingStation(ctx, station); err != nil {
		return nil, err
	}

	return station, nil
}

func (s *FillingStationService) GetFillingStationByID(ctx context.Context, id string) (*models.FillingStation, error) {
	fs, err := s.fsRepo.GetFillingStationByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if fs == nil {
		return nil, utils.NewAppError(404, "FILLING_STATION_NOT_FOUND", "Filling station not found")
	}
	return fs, nil
}

func (s *FillingStationService) ListFillingStations(ctx context.Context) ([]*models.FillingStation, error) {
	return s.fsRepo.ListFillingStations(ctx)
}

func (s *FillingStationService) GetRecommendedFillingStations(ctx context.Context, dropOffLocationID string) ([]*models.FillingStation, error) {
	if dropOffLocationID != "" {
		dropOff, err := s.locRepo.GetDropOffLocationByID(ctx, dropOffLocationID)
		if err != nil {
			return nil, err
		}
		if dropOff == nil {
			return nil, utils.NewAppError(404, "DROP_OFF_LOCATION_NOT_FOUND", "Drop-off location not found")
		}
	}

	// Stations ordered by lowest truck count / highest availability
	return s.fsRepo.ListFillingStations(ctx)
}

package services

import (
	"context"
	"time"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type DistrictManagerService struct {
	dmRepo     *repositories.DistrictManagerRepository
	personRepo *repositories.PersonRepository
	reqRepo    *repositories.RequestRepository
}

func NewDistrictManagerService(dmRepo *repositories.DistrictManagerRepository, personRepo *repositories.PersonRepository, reqRepo *repositories.RequestRepository) *DistrictManagerService {
	return &DistrictManagerService{
		dmRepo:     dmRepo,
		personRepo: personRepo,
		reqRepo:    reqRepo,
	}
}

type CreateDistrictManagerInput struct {
	Name           string  `json:"name"`
	ContactNumber  string  `json:"contactNumber"`
	NormalPersonID string  `json:"normalPersonId"`
	LocationID     *string `json:"locationId"`
}

func (s *DistrictManagerService) CreateDistrictManager(ctx context.Context, input CreateDistrictManagerInput) (*models.DistrictManager, error) {
	if input.Name == "" || input.ContactNumber == "" || input.NormalPersonID == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Name, contactNumber, and normalPersonId are required")
	}

	person, err := s.personRepo.GetPersonByID(ctx, input.NormalPersonID)
	if err != nil {
		return nil, err
	}
	if person == nil {
		return nil, utils.NewAppError(404, "PERSON_NOT_FOUND", "Associated NormalPerson not found")
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	dm := &models.DistrictManager{
		ID:             id,
		Name:           input.Name,
		ContactNumber:  input.ContactNumber,
		NormalPersonID: input.NormalPersonID,
		LocationID:     input.LocationID,
		CreatedAt:      time.Now(),
		NormalPerson:   person,
	}

	if err := s.dmRepo.CreateDistrictManager(ctx, dm); err != nil {
		return nil, err
	}

	return dm, nil
}

func (s *DistrictManagerService) GetDistrictManagerByID(ctx context.Context, id string) (*models.DistrictManager, error) {
	dm, err := s.dmRepo.GetDistrictManagerByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if dm == nil {
		return nil, utils.NewAppError(404, "DISTRICT_MANAGER_NOT_FOUND", "District Manager not found")
	}
	return dm, nil
}

func (s *DistrictManagerService) ListDistrictManagers(ctx context.Context) ([]*models.DistrictManager, error) {
	return s.dmRepo.ListDistrictManagers(ctx)
}

func (s *DistrictManagerService) GetDistrictManagerRequests(ctx context.Context, id string) ([]*models.Request, error) {
	dm, err := s.GetDistrictManagerByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if dm.LocationID == nil || *dm.LocationID == "" {
		return []*models.Request{}, nil
	}

	return s.reqRepo.GetRequestsByDropOffLocationID(ctx, *dm.LocationID)
}

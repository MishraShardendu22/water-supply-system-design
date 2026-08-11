package services

import (
	"context"
	"time"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type PersonService struct {
	personRepo *repositories.PersonRepository
	locRepo    *repositories.LocationRepository
}

func NewPersonService(personRepo *repositories.PersonRepository, locRepo *repositories.LocationRepository) *PersonService {
	return &PersonService{
		personRepo: personRepo,
		locRepo:    locRepo,
	}
}

type CreatePersonInput struct {
	Name          string  `json:"name"`
	ContactNumber string  `json:"contactNumber"`
	Address       *string `json:"address"`
	LocationID    *string `json:"locationId"`
}

func (s *PersonService) CreatePerson(ctx context.Context, input CreatePersonInput) (*models.NormalPerson, error) {
	if input.Name == "" || input.ContactNumber == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Name and contact number are required")
	}

	if input.LocationID != nil && *input.LocationID != "" {
		loc, err := s.locRepo.GetLocationByID(ctx, *input.LocationID)
		if err != nil {
			return nil, err
		}
		if loc == nil {
			return nil, utils.NewAppError(404, "LOCATION_NOT_FOUND", "Associated location not found")
		}
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	person := &models.NormalPerson{
		ID:            id,
		Name:          input.Name,
		ContactNumber: input.ContactNumber,
		Address:       input.Address,
		LocationID:    input.LocationID,
		CreatedAt:     time.Now(),
	}

	if err := s.personRepo.CreatePerson(ctx, person); err != nil {
		return nil, err
	}

	return person, nil
}

func (s *PersonService) GetPersonByID(ctx context.Context, id string) (*models.NormalPerson, error) {
	person, err := s.personRepo.GetPersonByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if person == nil {
		return nil, utils.NewAppError(404, "PERSON_NOT_FOUND", "Person not found")
	}
	return person, nil
}

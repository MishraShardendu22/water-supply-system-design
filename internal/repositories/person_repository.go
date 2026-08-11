package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type PersonRepository struct {
	db *database.DB
}

func NewPersonRepository(db *database.DB) *PersonRepository {
	return &PersonRepository{db: db}
}

func (r *PersonRepository) CreatePerson(ctx context.Context, person *models.NormalPerson) error {
	query := `
		INSERT INTO normal_persons (id, name, contact_number, address, location_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, person.ID, person.Name, person.ContactNumber, person.Address, person.LocationID, person.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert normal person: %w", err)
	}
	return nil
}

func (r *PersonRepository) GetPersonByID(ctx context.Context, id string) (*models.NormalPerson, error) {
	query := `
		SELECT 
			p.id, p.name, p.contact_number, p.address, p.location_id, p.created_at,
			l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at
		FROM normal_persons p
		LEFT JOIN locations l ON p.location_id = l.id
		WHERE p.id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var p models.NormalPerson
	var locID, locAddress, locLandmark sql.NullString
	var locLat, locLng sql.NullFloat64
	var locCreatedAt sql.NullTime

	err := row.Scan(
		&p.ID, &p.Name, &p.ContactNumber, &p.Address, &p.LocationID, &p.CreatedAt,
		&locID, &locAddress, &locLat, &locLng, &locLandmark, &locCreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query normal person: %w", err)
	}

	if locID.Valid {
		l := &models.Location{
			ID:        locID.String,
			Address:   locAddress.String,
			Latitude:  locLat.Float64,
			Longitude: locLng.Float64,
			CreatedAt: locCreatedAt.Time,
		}
		if locLandmark.Valid {
			l.Landmark = &locLandmark.String
		}
		p.Location = l
	}

	return &p, nil
}

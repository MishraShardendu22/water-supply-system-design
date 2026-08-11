package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type DistrictManagerRepository struct {
	db *database.DB
}

func NewDistrictManagerRepository(db *database.DB) *DistrictManagerRepository {
	return &DistrictManagerRepository{db: db}
}

func (r *DistrictManagerRepository) CreateDistrictManager(ctx context.Context, dm *models.DistrictManager) error {
	query := `
		INSERT INTO district_managers (id, name, contact_number, normal_person_id, location_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, dm.ID, dm.Name, dm.ContactNumber, dm.NormalPersonID, dm.LocationID, dm.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert district manager: %w", err)
	}
	return nil
}

func (r *DistrictManagerRepository) GetDistrictManagerByID(ctx context.Context, id string) (*models.DistrictManager, error) {
	query := `
		SELECT 
			dm.id, dm.name, dm.contact_number, dm.normal_person_id, dm.location_id, dm.created_at,
			p.id, p.name, p.contact_number, p.address, p.created_at,
			l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at
		FROM district_managers dm
		JOIN normal_persons p ON dm.normal_person_id = p.id
		LEFT JOIN locations l ON dm.location_id = l.id
		WHERE dm.id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var dm models.DistrictManager
	var p models.NormalPerson
	var locID, locAddress, locLandmark sql.NullString
	var locLat, locLng sql.NullFloat64
	var locCreatedAt sql.NullTime

	err := row.Scan(
		&dm.ID, &dm.Name, &dm.ContactNumber, &dm.NormalPersonID, &dm.LocationID, &dm.CreatedAt,
		&p.ID, &p.Name, &p.ContactNumber, &p.Address, &p.CreatedAt,
		&locID, &locAddress, &locLat, &locLng, &locLandmark, &locCreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query district manager: %w", err)
	}
	dm.NormalPerson = &p

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
		dm.Location = l
	}

	return &dm, nil
}

func (r *DistrictManagerRepository) ListDistrictManagers(ctx context.Context) ([]*models.DistrictManager, error) {
	query := `
		SELECT 
			dm.id, dm.name, dm.contact_number, dm.normal_person_id, dm.location_id, dm.created_at,
			p.id, p.name, p.contact_number, p.address, p.created_at
		FROM district_managers dm
		JOIN normal_persons p ON dm.normal_person_id = p.id
		ORDER BY dm.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list district managers: %w", err)
	}
	defer rows.Close()

	var list []*models.DistrictManager
	for rows.Next() {
		var dm models.DistrictManager
		var p models.NormalPerson
		if err := rows.Scan(
			&dm.ID, &dm.Name, &dm.ContactNumber, &dm.NormalPersonID, &dm.LocationID, &dm.CreatedAt,
			&p.ID, &p.Name, &p.ContactNumber, &p.Address, &p.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan district manager row: %w", err)
		}
		dm.NormalPerson = &p
		list = append(list, &dm)
	}
	return list, nil
}

package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type LocationRepository struct {
	db *database.DB
}

func NewLocationRepository(db *database.DB) *LocationRepository {
	return &LocationRepository{db: db}
}

func (r *LocationRepository) CreateLocation(ctx context.Context, loc *models.Location) error {
	query := `
		INSERT INTO locations (id, address, latitude, longitude, landmark, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, loc.ID, loc.Address, loc.Latitude, loc.Longitude, loc.Landmark, loc.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert location: %w", err)
	}
	return nil
}

func (r *LocationRepository) GetLocationByID(ctx context.Context, id string) (*models.Location, error) {
	query := `
		SELECT id, address, latitude, longitude, landmark, created_at
		FROM locations
		WHERE id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var loc models.Location
	err := row.Scan(&loc.ID, &loc.Address, &loc.Latitude, &loc.Longitude, &loc.Landmark, &loc.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query location: %w", err)
	}
	return &loc, nil
}

func (r *LocationRepository) CreateDropOffLocation(ctx context.Context, dropOff *models.DropOffLocation) error {
	query := `
		INSERT INTO drop_off_locations (id, has_private_borewell, traffic_risk, normal_travel_time, is_school_or_hospital, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, dropOff.ID, dropOff.HasPrivateBorewell, dropOff.TrafficRisk, dropOff.NormalTravelTime, dropOff.IsSchoolOrHospital, dropOff.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert drop-off location: %w", err)
	}
	return nil
}

func (r *LocationRepository) GetDropOffLocationByID(ctx context.Context, id string) (*models.DropOffLocation, error) {
	query := `
		SELECT 
			d.id, d.has_private_borewell, d.traffic_risk, d.normal_travel_time, d.is_school_or_hospital, d.created_at,
			l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at
		FROM drop_off_locations d
		JOIN locations l ON d.id = l.id
		WHERE d.id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var d models.DropOffLocation
	var l models.Location
	err := row.Scan(
		&d.ID, &d.HasPrivateBorewell, &d.TrafficRisk, &d.NormalTravelTime, &d.IsSchoolOrHospital, &d.CreatedAt,
		&l.ID, &l.Address, &l.Latitude, &l.Longitude, &l.Landmark, &l.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query drop-off location: %w", err)
	}
	d.Location = &l
	return &d, nil
}

func (r *LocationRepository) ListDropOffLocations(ctx context.Context) ([]*models.DropOffLocation, error) {
	query := `
		SELECT 
			d.id, d.has_private_borewell, d.traffic_risk, d.normal_travel_time, d.is_school_or_hospital, d.created_at,
			l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at
		FROM drop_off_locations d
		JOIN locations l ON d.id = l.id
		ORDER BY d.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list drop-off locations: %w", err)
	}
	defer rows.Close()

	var list []*models.DropOffLocation
	for rows.Next() {
		var d models.DropOffLocation
		var l models.Location
		if err := rows.Scan(
			&d.ID, &d.HasPrivateBorewell, &d.TrafficRisk, &d.NormalTravelTime, &d.IsSchoolOrHospital, &d.CreatedAt,
			&l.ID, &l.Address, &l.Latitude, &l.Longitude, &l.Landmark, &l.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan drop-off location row: %w", err)
		}
		d.Location = &l
		list = append(list, &d)
	}
	return list, nil
}

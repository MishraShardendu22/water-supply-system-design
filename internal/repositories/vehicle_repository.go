package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type VehicleRepository struct {
	db *database.DB
}

func NewVehicleRepository(db *database.DB) *VehicleRepository {
	return &VehicleRepository{db: db}
}

func (r *VehicleRepository) CreateVehicle(ctx context.Context, v *models.Vehicle) error {
	query := `
		INSERT INTO vehicles (id, type, capacity, current_location_id, status, assigned_driver_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query, v.ID, v.Type, v.Capacity, v.CurrentLocationID, v.Status, v.AssignedDriverID, v.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert vehicle: %w", err)
	}
	return nil
}

func (r *VehicleRepository) GetVehicleByID(ctx context.Context, id string) (*models.Vehicle, error) {
	query := `
		SELECT 
			v.id, v.type, v.capacity, v.current_location_id, v.status, v.assigned_driver_id, v.created_at,
			l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at,
			d.id, d.name, d.contact_number, d.phone_type, d.total_rating, d.total_deliveries, d.status, d.created_at
		FROM vehicles v
		LEFT JOIN locations l ON v.current_location_id = l.id
		LEFT JOIN drivers d ON v.assigned_driver_id = d.id
		WHERE v.id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var v models.Vehicle
	var locID, locAddr, locLandmark sql.NullString
	var locLat, locLng sql.NullFloat64
	var locCreatedAt sql.NullTime

	var drvID, drvName, drvContact, drvPhoneType, drvStatus sql.NullString
	var drvRating sql.NullFloat64
	var drvDeliveries sql.NullInt64
	var drvCreatedAt sql.NullTime

	err := row.Scan(
		&v.ID, &v.Type, &v.Capacity, &v.CurrentLocationID, &v.Status, &v.AssignedDriverID, &v.CreatedAt,
		&locID, &locAddr, &locLat, &locLng, &locLandmark, &locCreatedAt,
		&drvID, &drvName, &drvContact, &drvPhoneType, &drvRating, &drvDeliveries, &drvStatus, &drvCreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query vehicle: %w", err)
	}

	if locID.Valid {
		l := &models.Location{
			ID:        locID.String,
			Address:   locAddr.String,
			Latitude:  locLat.Float64,
			Longitude: locLng.Float64,
			CreatedAt: locCreatedAt.Time,
		}
		if locLandmark.Valid {
			l.Landmark = &locLandmark.String
		}
		v.CurrentLocation = l
	}

	if drvID.Valid {
		v.AssignedDriver = &models.Driver{
			ID:              drvID.String,
			Name:            drvName.String,
			ContactNumber:   drvContact.String,
			PhoneType:       drvPhoneType.String,
			TotalRating:     drvRating.Float64,
			TotalDeliveries: int(drvDeliveries.Int64),
			Status:          drvStatus.String,
			CreatedAt:       drvCreatedAt.Time,
		}
	}

	return &v, nil
}

func (r *VehicleRepository) ListVehicles(ctx context.Context) ([]*models.Vehicle, error) {
	query := `
		SELECT id, type, capacity, current_location_id, status, assigned_driver_id, created_at
		FROM vehicles
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list vehicles: %w", err)
	}
	defer rows.Close()

	var list []*models.Vehicle
	for rows.Next() {
		var v models.Vehicle
		if err := rows.Scan(&v.ID, &v.Type, &v.Capacity, &v.CurrentLocationID, &v.Status, &v.AssignedDriverID, &v.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan vehicle row: %w", err)
		}
		list = append(list, &v)
	}
	return list, nil
}

func (r *VehicleRepository) GetAvailableVehicles(ctx context.Context) ([]*models.Vehicle, error) {
	query := `
		SELECT id, type, capacity, current_location_id, status, assigned_driver_id, created_at
		FROM vehicles
		WHERE status = 'Available'
		ORDER BY capacity DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get available vehicles: %w", err)
	}
	defer rows.Close()

	var list []*models.Vehicle
	for rows.Next() {
		var v models.Vehicle
		if err := rows.Scan(&v.ID, &v.Type, &v.Capacity, &v.CurrentLocationID, &v.Status, &v.AssignedDriverID, &v.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan available vehicle row: %w", err)
		}
		list = append(list, &v)
	}
	return list, nil
}

func (r *VehicleRepository) UpdateVehicleStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE vehicles SET status = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update vehicle status: %w", err)
	}
	return nil
}

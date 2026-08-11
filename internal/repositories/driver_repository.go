package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type DriverRepository struct {
	db *database.DB
}

func NewDriverRepository(db *database.DB) *DriverRepository {
	return &DriverRepository{db: db}
}

func (r *DriverRepository) CreateDriver(ctx context.Context, driver *models.Driver) error {
	query := `
		INSERT INTO drivers (id, name, contact_number, phone_type, total_rating, total_deliveries, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(ctx, query, driver.ID, driver.Name, driver.ContactNumber, driver.PhoneType, driver.TotalRating, driver.TotalDeliveries, driver.Status, driver.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert driver: %w", err)
	}
	return nil
}

func (r *DriverRepository) GetDriverByID(ctx context.Context, id string) (*models.Driver, error) {
	query := `
		SELECT id, name, contact_number, phone_type, total_rating, total_deliveries, status, created_at
		FROM drivers
		WHERE id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var d models.Driver
	err := row.Scan(&d.ID, &d.Name, &d.ContactNumber, &d.PhoneType, &d.TotalRating, &d.TotalDeliveries, &d.Status, &d.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query driver: %w", err)
	}
	return &d, nil
}

func (r *DriverRepository) ListDrivers(ctx context.Context) ([]*models.Driver, error) {
	query := `
		SELECT id, name, contact_number, phone_type, total_rating, total_deliveries, status, created_at
		FROM drivers
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list drivers: %w", err)
	}
	defer rows.Close()

	var list []*models.Driver
	for rows.Next() {
		var d models.Driver
		if err := rows.Scan(&d.ID, &d.Name, &d.ContactNumber, &d.PhoneType, &d.TotalRating, &d.TotalDeliveries, &d.Status, &d.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan driver row: %w", err)
		}
		list = append(list, &d)
	}
	return list, nil
}

func (r *DriverRepository) GetRecommendedDrivers(ctx context.Context, dropOffLocationID string) ([]*models.DriverRecommendation, error) {
	query := `
		SELECT 
			d.id, d.name, d.contact_number, d.phone_type, d.total_rating, d.total_deliveries, d.status, d.created_at,
			COALESCE(loc_history.cnt, 0) AS location_delivery_count
		FROM drivers d
		LEFT JOIN (
			SELECT driver_id, COUNT(*) AS cnt
			FROM requests
			WHERE drop_off_location_id = $1 AND status = 'COMPLETED' AND driver_id IS NOT NULL
			GROUP BY driver_id
		) loc_history ON d.id = loc_history.driver_id
		ORDER BY location_delivery_count DESC, (d.status = 'Available') DESC, d.total_deliveries DESC, d.total_rating DESC
	`
	rows, err := r.db.QueryContext(ctx, query, dropOffLocationID)
	if err != nil {
		return nil, fmt.Errorf("failed to query recommended drivers: %w", err)
	}
	defer rows.Close()

	var recommendations []*models.DriverRecommendation
	for rows.Next() {
		var d models.Driver
		var locCount int
		if err := rows.Scan(&d.ID, &d.Name, &d.ContactNumber, &d.PhoneType, &d.TotalRating, &d.TotalDeliveries, &d.Status, &d.CreatedAt, &locCount); err != nil {
			return nil, fmt.Errorf("failed to scan driver recommendation row: %w", err)
		}

		reason := "Available driver"
		if locCount > 0 {
			reason = fmt.Sprintf("Delivered %d time(s) to this drop-off location before (familiar route)", locCount)
		}

		recommendations = append(recommendations, &models.DriverRecommendation{
			Driver:                d,
			LocationDeliveryCount: locCount,
			RecommendationReason:  reason,
		})
	}

	return recommendations, nil
}

func (r *DriverRepository) UpdateDriverStatus(ctx context.Context, driverID string, status string) error {
	query := `UPDATE drivers SET status = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, status, driverID)
	if err != nil {
		return fmt.Errorf("failed to update driver status: %w", err)
	}
	return nil
}

func (r *DriverRepository) IncrementDriverDeliveries(ctx context.Context, driverID string) error {
	query := `UPDATE drivers SET total_deliveries = total_deliveries + 1, status = 'Available' WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, driverID)
	if err != nil {
		return fmt.Errorf("failed to increment driver deliveries: %w", err)
	}
	return nil
}

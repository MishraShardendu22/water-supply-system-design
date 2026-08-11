package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type FillingStationRepository struct {
	db *database.DB
}

func NewFillingStationRepository(db *database.DB) *FillingStationRepository {
	return &FillingStationRepository{db: db}
}

func (r *FillingStationRepository) CreateFillingStation(ctx context.Context, station *models.FillingStation) error {
	query := `
		INSERT INTO filling_stations (id, name, location_id, current_truck_count, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, query, station.ID, station.Name, station.LocationID, station.CurrentTruckCount, station.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert filling station: %w", err)
	}
	return nil
}

func (r *FillingStationRepository) GetFillingStationByID(ctx context.Context, id string) (*models.FillingStation, error) {
	query := `
		SELECT 
			fs.id, fs.name, fs.location_id, fs.current_truck_count, fs.created_at,
			l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at
		FROM filling_stations fs
		JOIN locations l ON fs.location_id = l.id
		WHERE fs.id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var fs models.FillingStation
	var l models.Location
	err := row.Scan(
		&fs.ID, &fs.Name, &fs.LocationID, &fs.CurrentTruckCount, &fs.CreatedAt,
		&l.ID, &l.Address, &l.Latitude, &l.Longitude, &l.Landmark, &l.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query filling station: %w", err)
	}
	fs.Location = &l
	fs.Availability = calculateAvailability(fs.CurrentTruckCount)
	return &fs, nil
}

func (r *FillingStationRepository) ListFillingStations(ctx context.Context) ([]*models.FillingStation, error) {
	query := `
		SELECT 
			fs.id, fs.name, fs.location_id, fs.current_truck_count, fs.created_at,
			l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at
		FROM filling_stations fs
		JOIN locations l ON fs.location_id = l.id
		ORDER BY fs.current_truck_count ASC, fs.name ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list filling stations: %w", err)
	}
	defer rows.Close()

	var list []*models.FillingStation
	for rows.Next() {
		var fs models.FillingStation
		var l models.Location
		if err := rows.Scan(
			&fs.ID, &fs.Name, &fs.LocationID, &fs.CurrentTruckCount, &fs.CreatedAt,
			&l.ID, &l.Address, &l.Latitude, &l.Longitude, &l.Landmark, &l.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan filling station row: %w", err)
		}
		fs.Location = &l
		fs.Availability = calculateAvailability(fs.CurrentTruckCount)
		list = append(list, &fs)
	}
	return list, nil
}

func (r *FillingStationRepository) IncrementTruckCount(ctx context.Context, stationID string) error {
	query := `UPDATE filling_stations SET current_truck_count = current_truck_count + 1 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, stationID)
	if err != nil {
		return fmt.Errorf("failed to increment truck count: %w", err)
	}
	return nil
}

func (r *FillingStationRepository) DecrementTruckCount(ctx context.Context, stationID string) error {
	query := `UPDATE filling_stations SET current_truck_count = GREATEST(0, current_truck_count - 1) WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, stationID)
	if err != nil {
		return fmt.Errorf("failed to decrement truck count: %w", err)
	}
	return nil
}

func calculateAvailability(truckCount int) string {
	if truckCount <= 2 {
		return models.StationStatusAvailable
	} else if truckCount <= 5 {
		return models.StationStatusBusy
	}
	return models.StationStatusVeryBusy
}

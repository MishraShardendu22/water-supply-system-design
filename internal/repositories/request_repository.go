package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type RequestRepository struct {
	db *database.DB
}

func NewRequestRepository(db *database.DB) *RequestRepository {
	return &RequestRepository{db: db}
}

func (r *RequestRepository) CreateRequest(ctx context.Context, req *models.Request) error {
	query := `
		INSERT INTO requests (id, request_type, requester_id, drop_off_location_id, filling_station_id, driver_id, vehicle_id, status, priority_score, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query, req.ID, req.RequestType, req.RequesterID, req.DropOffLocationID, req.FillingStationID, req.DriverID, req.VehicleID, req.Status, req.PriorityScore, req.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert request: %w", err)
	}
	return nil
}

const requestFullSelectQuery = `
	SELECT 
		r.id, r.request_type, r.requester_id, r.drop_off_location_id, r.filling_station_id, r.driver_id, r.vehicle_id,
		r.status, r.priority_score, r.otp_hash, r.otp_expires_at, r.created_at, r.dispatched_at, r.completed_at,
		p.id, p.name, p.contact_number, p.address,
		d.id, d.has_private_borewell, d.traffic_risk, d.normal_travel_time, d.is_school_or_hospital,
		l.id, l.address, l.latitude, l.longitude, l.landmark, l.created_at,
		fs.id, fs.name, fs.current_truck_count,
		drv.id, drv.name, drv.contact_number, drv.phone_type, drv.total_rating, drv.total_deliveries, drv.status,
		veh.id, veh.type, veh.capacity, veh.status
	FROM requests r
	JOIN normal_persons p ON r.requester_id = p.id
	JOIN drop_off_locations d ON r.drop_off_location_id = d.id
	LEFT JOIN locations l ON d.id = l.id
	LEFT JOIN filling_stations fs ON r.filling_station_id = fs.id
	LEFT JOIN drivers drv ON r.driver_id = drv.id
	LEFT JOIN vehicles veh ON r.vehicle_id = veh.id
`

func scanRequestRow(scanner interface {
	Scan(dest ...interface{}) error
}) (*models.Request, error) {
	var req models.Request
	var p models.NormalPerson
	var d models.DropOffLocation

	var locID, locAddress, locLandmark sql.NullString
	var locLat, locLng sql.NullFloat64
	var locCreatedAt sql.NullTime

	var fsID, fsName sql.NullString
	var fsTruckCount sql.NullInt64

	var drvID, drvName, drvContact, drvPhoneType, drvStatus sql.NullString
	var drvRating sql.NullFloat64
	var drvDeliveries sql.NullInt64

	var vehID, vehType, vehStatus sql.NullString
	var vehCapacity sql.NullInt64

	var otpHash sql.NullString
	var otpExpiresAt, dispatchedAt, completedAt sql.NullTime

	err := scanner.Scan(
		&req.ID, &req.RequestType, &req.RequesterID, &req.DropOffLocationID, &req.FillingStationID, &req.DriverID, &req.VehicleID,
		&req.Status, &req.PriorityScore, &otpHash, &otpExpiresAt, &req.CreatedAt, &dispatchedAt, &completedAt,
		&p.ID, &p.Name, &p.ContactNumber, &p.Address,
		&d.ID, &d.HasPrivateBorewell, &d.TrafficRisk, &d.NormalTravelTime, &d.IsSchoolOrHospital,
		&locID, &locAddress, &locLat, &locLng, &locLandmark, &locCreatedAt,
		&fsID, &fsName, &fsTruckCount,
		&drvID, &drvName, &drvContact, &drvPhoneType, &drvRating, &drvDeliveries, &drvStatus,
		&vehID, &vehType, &vehCapacity, &vehStatus,
	)
	if err != nil {
		return nil, err
	}

	req.Requester = &p
	req.DropOffLocation = &d

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
		d.Location = l
	}

	if otpHash.Valid {
		req.OTPHash = &otpHash.String
	}
	if otpExpiresAt.Valid {
		req.OTPExpiresAt = &otpExpiresAt.Time
	}
	if dispatchedAt.Valid {
		req.DispatchedAt = &dispatchedAt.Time
	}
	if completedAt.Valid {
		req.CompletedAt = &completedAt.Time
	}

	if fsID.Valid {
		cnt := int(fsTruckCount.Int64)
		req.FillingStation = &models.FillingStation{
			ID:                fsID.String,
			Name:              fsName.String,
			CurrentTruckCount: cnt,
			Availability:      calculateAvailability(cnt),
		}
	}

	if drvID.Valid {
		req.Driver = &models.Driver{
			ID:              drvID.String,
			Name:            drvName.String,
			ContactNumber:   drvContact.String,
			PhoneType:       drvPhoneType.String,
			TotalRating:     drvRating.Float64,
			TotalDeliveries: int(drvDeliveries.Int64),
			Status:          drvStatus.String,
		}
	}

	if vehID.Valid {
		req.Vehicle = &models.Vehicle{
			ID:       vehID.String,
			Type:     vehType.String,
			Capacity: int(vehCapacity.Int64),
			Status:   vehStatus.String,
		}
	}

	return &req, nil
}

func (r *RequestRepository) GetRequestByID(ctx context.Context, id string) (*models.Request, error) {
	query := requestFullSelectQuery + ` WHERE r.id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	req, err := scanRequestRow(row)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query request: %w", err)
	}
	return req, nil
}

func (r *RequestRepository) ListRequests(ctx context.Context, statusFilter string) ([]*models.Request, error) {
	query := requestFullSelectQuery
	var args []interface{}
	if statusFilter != "" {
		query += ` WHERE r.status = $1`
		args = append(args, statusFilter)
	}
	query += ` ORDER BY r.priority_score DESC, r.created_at ASC`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list requests: %w", err)
	}
	defer rows.Close()

	var list []*models.Request
	for rows.Next() {
		req, err := scanRequestRow(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan request row: %w", err)
		}
		list = append(list, req)
	}
	return list, nil
}

func (r *RequestRepository) GetRequestsByDriverID(ctx context.Context, driverID string) ([]*models.Request, error) {
	query := requestFullSelectQuery + ` WHERE r.driver_id = $1 ORDER BY r.created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, driverID)
	if err != nil {
		return nil, fmt.Errorf("failed to list requests by driver: %w", err)
	}
	defer rows.Close()

	var list []*models.Request
	for rows.Next() {
		req, err := scanRequestRow(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan driver request row: %w", err)
		}
		list = append(list, req)
	}
	return list, nil
}

func (r *RequestRepository) GetRequestsByDropOffLocationID(ctx context.Context, locationID string) ([]*models.Request, error) {
	query := requestFullSelectQuery + ` WHERE r.drop_off_location_id = $1 ORDER BY r.created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, locationID)
	if err != nil {
		return nil, fmt.Errorf("failed to list requests by drop off location: %w", err)
	}
	defer rows.Close()

	var list []*models.Request
	for rows.Next() {
		req, err := scanRequestRow(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan location request row: %w", err)
		}
		list = append(list, req)
	}
	return list, nil
}

func (r *RequestRepository) UpdateRequestPriority(ctx context.Context, id string, score float64, status string) error {
	query := `UPDATE requests SET priority_score = $1, status = $2 WHERE id = $3`
	_, err := r.db.ExecContext(ctx, query, score, status, id)
	if err != nil {
		return fmt.Errorf("failed to update request priority: %w", err)
	}
	return nil
}

func (r *RequestRepository) AssignRequest(ctx context.Context, id string, driverID, vehicleID, fillingStationID string) error {
	query := `UPDATE requests SET driver_id = $1, vehicle_id = $2, filling_station_id = $3, status = 'ASSIGNED' WHERE id = $4`
	_, err := r.db.ExecContext(ctx, query, driverID, vehicleID, fillingStationID, id)
	if err != nil {
		return fmt.Errorf("failed to assign request: %w", err)
	}
	return nil
}

func (r *RequestRepository) DispatchRequest(ctx context.Context, id string, dispatchedAt time.Time) error {
	query := `UPDATE requests SET status = 'DISPATCHED', dispatched_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, dispatchedAt, id)
	if err != nil {
		return fmt.Errorf("failed to dispatch request: %w", err)
	}
	return nil
}

func (r *RequestRepository) SetRequestOTP(ctx context.Context, id string, otpHash string, expiresAt time.Time) error {
	query := `UPDATE requests SET otp_hash = $1, otp_expires_at = $2 WHERE id = $3`
	_, err := r.db.ExecContext(ctx, query, otpHash, expiresAt, id)
	if err != nil {
		return fmt.Errorf("failed to set request OTP: %w", err)
	}
	return nil
}

func (r *RequestRepository) CompleteRequest(ctx context.Context, id string, completedAt time.Time) error {
	query := `UPDATE requests SET status = 'COMPLETED', completed_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, completedAt, id)
	if err != nil {
		return fmt.Errorf("failed to complete request: %w", err)
	}
	return nil
}

func (r *RequestRepository) CancelRequest(ctx context.Context, id string) error {
	query := `UPDATE requests SET status = 'CANCELLED' WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to cancel request: %w", err)
	}
	return nil
}

func (r *RequestRepository) CountPendingRequestsByRequester(ctx context.Context, requesterID string) (int, error) {
	query := `SELECT COUNT(*) FROM requests WHERE requester_id = $1 AND status IN ('PENDING', 'VERIFIED', 'ASSIGNED')`
	var count int
	err := r.db.QueryRowContext(ctx, query, requesterID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count pending requests for requester: %w", err)
	}
	return count, nil
}

func (r *RequestRepository) CountPendingRequestsByDropOffLocation(ctx context.Context, dropOffLocationID string) (int, error) {
	query := `SELECT COUNT(*) FROM requests WHERE drop_off_location_id = $1 AND status IN ('PENDING', 'VERIFIED', 'ASSIGNED')`
	var count int
	err := r.db.QueryRowContext(ctx, query, dropOffLocationID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count pending requests for drop off location: %w", err)
	}
	return count, nil
}

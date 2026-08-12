package models

import (
	"time"
)

// Request Status Constants
const (
	RequestStatusPending    = "PENDING"
	RequestStatusVerified   = "VERIFIED"
	RequestStatusAssigned   = "ASSIGNED"
	RequestStatusDispatched = "DISPATCHED"
	RequestStatusCompleted  = "COMPLETED"
	RequestStatusCancelled  = "CANCELLED"
)

// Request Type Constants
const (
	RequestTypeLetter  = "Letter"
	RequestTypeCall    = "Call"
	RequestTypeOnline  = "Online"
	RequestTypeOffline = "Offline"
)

// Driver Status Constants
const (
	DriverStatusAvailable  = "Available"
	DriverStatusOnDelivery = "On Delivery"
	DriverStatusInactive   = "Inactive"
)

// Driver Phone Type Constants
const (
	PhoneTypeBasic = "Basic"
	PhoneTypeSmart = "Smart"
)

// Vehicle Status Constants
const (
	VehicleStatusAvailable   = "Available"
	VehicleStatusOnDelivery  = "On Delivery"
	VehicleStatusMaintenance = "Maintenance"
)

// Vehicle Type Constants
const (
	VehicleTypeContracted = "Contracted"
	VehicleTypeMunicipal  = "Municipal"
)

// Traffic Risk Constants
const (
	TrafficRiskLow    = "Low"
	TrafficRiskMedium = "Medium"
	TrafficRiskHigh   = "High"
)

// Station Availability Constants
const (
	StationStatusAvailable = "AVAILABLE"
	StationStatusBusy      = "BUSY"
	StationStatusVeryBusy  = "VERY_BUSY"
)

type Location struct {
	ID        string    `json:"id"`
	Address   string    `json:"address"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Landmark  *string   `json:"landmark,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

type DropOffLocation struct {
	ID                 string    `json:"id"`
	HasPrivateBorewell bool      `json:"hasPrivateBorewell"`
	TrafficRisk        string    `json:"trafficRisk"`
	NormalTravelTime   int       `json:"normalTravelTime"` // in minutes
	IsSchoolOrHospital bool      `json:"isSchoolOrHospital"`
	CreatedAt          time.Time `json:"createdAt"`
	Location           *Location `json:"location,omitempty"`
}

type NormalPerson struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	ContactNumber string    `json:"contactNumber"`
	Address       *string   `json:"address,omitempty"`
	LocationID    *string   `json:"locationId,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	Location      *Location `json:"location,omitempty"`
}

type DistrictManager struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	ContactNumber  string        `json:"contactNumber"`
	NormalPersonID string        `json:"normalPersonId"`
	LocationID     *string       `json:"locationId,omitempty"`
	CreatedAt      time.Time     `json:"createdAt"`
	NormalPerson   *NormalPerson `json:"normalPerson,omitempty"`
	Location       *Location     `json:"location,omitempty"`
}

type Administration struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Mail          string    `json:"mail"`
	PasswordHash  string    `json:"-"`
	ContactNumber *string   `json:"contactNumber,omitempty"`
	Role          string    `json:"role"`
	CreatedAt     time.Time `json:"createdAt"`
}

type Driver struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	ContactNumber   string    `json:"contactNumber"`
	PhoneType       string    `json:"phoneType"`
	TotalRating     float64   `json:"totalRating"`
	TotalDeliveries int       `json:"totalDeliveries"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"createdAt"`
}

type DriverRecommendation struct {
	Driver                Driver `json:"driver"`
	LocationDeliveryCount int    `json:"locationDeliveryCount"`
	RecommendationReason  string `json:"recommendationReason"`
}

type Vehicle struct {
	ID                string    `json:"id"`
	Type              string    `json:"type"`
	Capacity          int       `json:"capacity"`
	CurrentLocationID *string   `json:"currentLocationId,omitempty"`
	Status            string    `json:"status"`
	AssignedDriverID  *string   `json:"assignedDriverId,omitempty"`
	CreatedAt         time.Time `json:"createdAt"`
	CurrentLocation   *Location `json:"currentLocation,omitempty"`
	AssignedDriver    *Driver   `json:"assignedDriver,omitempty"`
}

type FillingStation struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	LocationID        string    `json:"locationId"`
	CurrentTruckCount int       `json:"currentTruckCount"`
	Availability      string    `json:"availability"`
	CreatedAt         time.Time `json:"createdAt"`
	Location          *Location `json:"location,omitempty"`
}

type Request struct {
	ID                string           `json:"id"`
	RequestType       string           `json:"requestType"`
	RequesterID       string           `json:"requesterId"`
	DropOffLocationID string           `json:"dropOffLocationId"`
	FillingStationID  *string          `json:"fillingStationId,omitempty"`
	DriverID          *string          `json:"driverId,omitempty"`
	VehicleID         *string          `json:"vehicleId,omitempty"`
	Status            string           `json:"status"`
	PriorityScore     float64          `json:"priorityScore"`
	OTPHash           *string          `json:"-"`
	OTPExpiresAt      *time.Time       `json:"otpExpiresAt,omitempty"`
	CreatedAt         time.Time        `json:"createdAt"`
	DispatchedAt      *time.Time       `json:"dispatchedAt,omitempty"`
	CompletedAt       *time.Time       `json:"completedAt,omitempty"`
	Requester         *NormalPerson    `json:"requester,omitempty"`
	DropOffLocation   *DropOffLocation `json:"dropOffLocation,omitempty"`
	FillingStation    *FillingStation  `json:"fillingStation,omitempty"`
	Driver            *Driver          `json:"driver,omitempty"`
	Vehicle           *Vehicle         `json:"vehicle,omitempty"`
}

type PriorityCalculationResult struct {
	RequestID     string             `json:"requestId"`
	PriorityScore float64            `json:"priorityScore"`
	Breakdown     map[string]float64 `json:"breakdown"`
	Explanation   []string           `json:"explanation"`
}

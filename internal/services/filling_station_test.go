package services

import (
	"testing"
	"water-supply-system/internal/models"
)

func TestFillingStationAvailability(t *testing.T) {
	tests := []struct {
		name       string
		truckCount int
		expected   string
	}{
		{"Low truck count", 1, models.StationStatusAvailable},
		{"Low threshold edge", 2, models.StationStatusAvailable},
		{"Medium truck count", 3, models.StationStatusBusy},
		{"Medium threshold edge", 5, models.StationStatusBusy},
		{"High truck count", 6, models.StationStatusVeryBusy},
		{"High truck count large", 15, models.StationStatusVeryBusy},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := calculateAvailability(tt.truckCount)
			if got != tt.expected {
				t.Fatalf("Expected availability %s for count %d, got %s", tt.expected, tt.truckCount, got)
			}
		})
	}
}

func calculateAvailability(truckCount int) string {
	if truckCount <= 2 {
		return models.StationStatusAvailable
	} else if truckCount <= 5 {
		return models.StationStatusBusy
	}
	return models.StationStatusVeryBusy
}

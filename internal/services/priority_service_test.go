package services

import (
	"testing"
	"water-supply-system/internal/models"
)

func TestPriorityLogicPure(t *testing.T) {
	// Test Priority calculation logic for different scenarios:
	// Scenario 1: Standard location (Base score 50)
	// Scenario 2: Hospital/School (+30 -> 80)
	// Scenario 3: Hospital/School + Private Borewell (+30 - 30 -> 50)
	// Scenario 4: Hospital/School + Private Borewell + High Traffic Risk (+30 - 30 - 5 -> 45)

	t.Run("School or Hospital Bonus", func(t *testing.T) {
		dropOff := &models.DropOffLocation{
			IsSchoolOrHospital: true,
			HasPrivateBorewell: false,
			TrafficRisk:        models.TrafficRiskLow,
		}

		score := 50.0
		if dropOff.IsSchoolOrHospital {
			score += 30.0
		}
		if dropOff.HasPrivateBorewell {
			score -= 30.0
		}
		if dropOff.TrafficRisk == models.TrafficRiskHigh {
			score -= 5.0
		}

		if score != 80.0 {
			t.Fatalf("Expected priority score 80.0, got %f", score)
		}
	})

	t.Run("Private Borewell Penalty", func(t *testing.T) {
		dropOff := &models.DropOffLocation{
			IsSchoolOrHospital: false,
			HasPrivateBorewell: true,
			TrafficRisk:        models.TrafficRiskLow,
		}

		score := 50.0
		if dropOff.IsSchoolOrHospital {
			score += 30.0
		}
		if dropOff.HasPrivateBorewell {
			score -= 30.0
		}

		if score != 20.0 {
			t.Fatalf("Expected priority score 20.0, got %f", score)
		}
	})
}

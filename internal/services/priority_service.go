package services

import (
	"context"
	"fmt"

	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type PriorityService struct {
	reqRepo *repositories.RequestRepository
	locRepo *repositories.LocationRepository
}

func NewPriorityService(reqRepo *repositories.RequestRepository, locRepo *repositories.LocationRepository) *PriorityService {
	return &PriorityService{
		reqRepo: reqRepo,
		locRepo: locRepo,
	}
}

func (s *PriorityService) CalculatePriority(ctx context.Context, req *models.Request) (*models.PriorityCalculationResult, error) {
	dropOff, err := s.locRepo.GetDropOffLocationByID(ctx, req.DropOffLocationID)
	if err != nil {
		return nil, err
	}
	if dropOff == nil {
		return nil, utils.ErrNotFound
	}

	// Count previous pending requests for this location and requester
	pendingLocCount, err := s.reqRepo.CountPendingRequestsByDropOffLocation(ctx, req.DropOffLocationID)
	if err != nil {
		return nil, err
	}

	score := 50.0
	breakdown := make(map[string]float64)
	var explanation []string

	breakdown["base_score"] = 50.0
	explanation = append(explanation, "Base request priority: +50.0")

	// School or Hospital priority
	if dropOff.IsSchoolOrHospital {
		score += 30.0
		breakdown["school_hospital_bonus"] = 30.0
		explanation = append(explanation, "Public institution (School/Hospital): +30.0")
	}

	// Previous pending requests multiplier
	if pendingLocCount > 1 { // More than current request
		bonus := float64((pendingLocCount - 1) * 20)
		if bonus > 40.0 {
			bonus = 40.0
		}
		score += bonus
		breakdown["pending_requests_bonus"] = bonus
		explanation = append(explanation, "Unfulfilled prior request history: +"+floatToString(bonus))
	}

	// Private borewell penalty
	if dropOff.HasPrivateBorewell {
		score -= 30.0
		breakdown["private_borewell_penalty"] = -30.0
		explanation = append(explanation, "Location has alternative private borewell: -30.0")
	}

	// Traffic risk penalty
	if dropOff.TrafficRisk == models.TrafficRiskHigh {
		score -= 5.0
		breakdown["traffic_risk_penalty"] = -5.0
		explanation = append(explanation, "High traffic risk area: -5.0")
	}

	if score < 0.0 {
		score = 0.0
	} else if score > 100.0 {
		score = 100.0
	}

	return &models.PriorityCalculationResult{
		RequestID:     req.ID,
		PriorityScore: score,
		Breakdown:     breakdown,
		Explanation:   explanation,
	}, nil
}

func floatToString(v float64) string {
	return fmt.Sprintf("%.1f", v)
}

package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type FillingStationController struct {
	fsService *services.FillingStationService
}

func NewFillingStationController(fsService *services.FillingStationService) *FillingStationController {
	return &FillingStationController{fsService: fsService}
}

func (c *FillingStationController) CreateFillingStation(ctx *fiber.Ctx) error {
	var input services.CreateFillingStationInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	station, err := c.fsService.CreateFillingStation(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, station)
}

func (c *FillingStationController) ListFillingStations(ctx *fiber.Ctx) error {
	stations, err := c.fsService.ListFillingStations(ctx.Context())
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, stations)
}

func (c *FillingStationController) GetFillingStationByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	station, err := c.fsService.GetFillingStationByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, station)
}

func (c *FillingStationController) GetRecommendedFillingStations(ctx *fiber.Ctx) error {
	dropOffLocationID := ctx.Query("dropOffLocationId")
	stations, err := c.fsService.GetRecommendedFillingStations(ctx.Context(), dropOffLocationID)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, stations)
}

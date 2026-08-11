package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type DropOffLocationController struct {
	locService *services.LocationService
}

func NewDropOffLocationController(locService *services.LocationService) *DropOffLocationController {
	return &DropOffLocationController{locService: locService}
}

func (c *DropOffLocationController) CreateDropOffLocation(ctx *fiber.Ctx) error {
	var input services.CreateDropOffLocationInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	dropOff, err := c.locService.CreateDropOffLocation(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, dropOff)
}

func (c *DropOffLocationController) ListDropOffLocations(ctx *fiber.Ctx) error {
	locations, err := c.locService.ListDropOffLocations(ctx.Context())
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, locations)
}

func (c *DropOffLocationController) GetDropOffLocationByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	dropOff, err := c.locService.GetDropOffLocationByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, dropOff)
}

func (c *DropOffLocationController) GetDriversForDropOffLocation(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	drivers, err := c.locService.GetDriversForDropOffLocation(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, drivers)
}

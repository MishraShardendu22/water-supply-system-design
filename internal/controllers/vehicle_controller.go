package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type VehicleController struct {
	vehicleService *services.VehicleService
}

func NewVehicleController(vehicleService *services.VehicleService) *VehicleController {
	return &VehicleController{vehicleService: vehicleService}
}

func (c *VehicleController) CreateVehicle(ctx *fiber.Ctx) error {
	var input services.CreateVehicleInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	vehicle, err := c.vehicleService.CreateVehicle(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, vehicle)
}

func (c *VehicleController) ListVehicles(ctx *fiber.Ctx) error {
	vehicles, err := c.vehicleService.ListVehicles(ctx.Context())
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, vehicles)
}

func (c *VehicleController) GetAvailableVehicles(ctx *fiber.Ctx) error {
	vehicles, err := c.vehicleService.GetAvailableVehicles(ctx.Context())
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, vehicles)
}

func (c *VehicleController) GetVehicleByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	vehicle, err := c.vehicleService.GetVehicleByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, vehicle)
}

type UpdateVehicleStatusBody struct {
	Status string `json:"status"`
}

func (c *VehicleController) UpdateVehicleStatus(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var body UpdateVehicleStatusBody
	if err := ctx.BodyParser(&body); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	vehicle, err := c.vehicleService.UpdateVehicleStatus(ctx.Context(), id, body.Status)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 200, vehicle)
}

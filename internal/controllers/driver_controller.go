package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type DriverController struct {
	driverService *services.DriverService
}

func NewDriverController(driverService *services.DriverService) *DriverController {
	return &DriverController{driverService: driverService}
}

func (c *DriverController) CreateDriver(ctx *fiber.Ctx) error {
	var input services.CreateDriverInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	driver, err := c.driverService.CreateDriver(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, driver)
}

func (c *DriverController) ListDrivers(ctx *fiber.Ctx) error {
	drivers, err := c.driverService.ListDrivers(ctx.Context())
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, drivers)
}

func (c *DriverController) GetDriverByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	driver, err := c.driverService.GetDriverByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, driver)
}

func (c *DriverController) GetRecommendedDrivers(ctx *fiber.Ctx) error {
	dropOffLocationID := ctx.Query("dropOffLocationId")
	recommendations, err := c.driverService.GetRecommendedDrivers(ctx.Context(), dropOffLocationID)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, recommendations)
}

func (c *DriverController) GetDriverRequests(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	requests, err := c.driverService.GetDriverRequests(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, requests)
}

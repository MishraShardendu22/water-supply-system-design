package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type DistrictManagerController struct {
	dmService *services.DistrictManagerService
}

func NewDistrictManagerController(dmService *services.DistrictManagerService) *DistrictManagerController {
	return &DistrictManagerController{dmService: dmService}
}

func (c *DistrictManagerController) CreateDistrictManager(ctx *fiber.Ctx) error {
	var input services.CreateDistrictManagerInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	dm, err := c.dmService.CreateDistrictManager(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, dm)
}

func (c *DistrictManagerController) ListDistrictManagers(ctx *fiber.Ctx) error {
	managers, err := c.dmService.ListDistrictManagers(ctx.Context())
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, managers)
}

func (c *DistrictManagerController) GetDistrictManagerByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	dm, err := c.dmService.GetDistrictManagerByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, dm)
}

func (c *DistrictManagerController) GetDistrictManagerRequests(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	requests, err := c.dmService.GetDistrictManagerRequests(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, requests)
}

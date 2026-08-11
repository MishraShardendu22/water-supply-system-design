package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type AdminController struct {
	adminService *services.AdminService
}

func NewAdminController(adminService *services.AdminService) *AdminController {
	return &AdminController{adminService: adminService}
}

func (c *AdminController) CreateAdmin(ctx *fiber.Ctx) error {
	var input services.CreateAdminInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	admin, err := c.adminService.CreateAdmin(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, admin)
}

func (c *AdminController) ListAdmins(ctx *fiber.Ctx) error {
	admins, err := c.adminService.ListAdmins(ctx.Context())
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, admins)
}

func (c *AdminController) GetAdminByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	admin, err := c.adminService.GetAdminByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, admin)
}

func (c *AdminController) UpdateAdmin(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var input services.UpdateAdminInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	admin, err := c.adminService.UpdateAdmin(ctx.Context(), id, input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, admin)
}

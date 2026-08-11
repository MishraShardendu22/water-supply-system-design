package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type AuthController struct {
	adminService *services.AdminService
}

func NewAuthController(adminService *services.AdminService) *AuthController {
	return &AuthController{adminService: adminService}
}

func (c *AuthController) Login(ctx *fiber.Ctx) error {
	var input services.LoginInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	res, err := c.adminService.Login(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 200, res)
}

package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type RequestController struct {
	reqService *services.RequestService
}

func NewRequestController(reqService *services.RequestService) *RequestController {
	return &RequestController{reqService: reqService}
}

func (c *RequestController) CreateRequest(ctx *fiber.Ctx) error {
	var input services.CreateRequestInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	req, err := c.reqService.CreateRequest(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, req)
}

func (c *RequestController) ListRequests(ctx *fiber.Ctx) error {
	statusFilter := ctx.Query("status")
	requests, err := c.reqService.ListRequests(ctx.Context(), statusFilter)
	if err != nil {
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, requests)
}

func (c *RequestController) GetRequestByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	req, err := c.reqService.GetRequestByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, req)
}

func (c *RequestController) CalculatePriority(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	res, err := c.reqService.CalculatePriority(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, res)
}

func (c *RequestController) GetRequestStatus(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	res, err := c.reqService.GetRequestStatus(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, res)
}

func (c *RequestController) AssignRequest(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var input services.AssignRequestInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	req, err := c.reqService.AssignRequest(ctx.Context(), id, input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 200, req)
}

func (c *RequestController) DispatchRequest(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	req, err := c.reqService.DispatchRequest(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 200, req)
}

func (c *RequestController) GenerateOTP(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	res, err := c.reqService.GenerateOTP(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 200, res)
}

func (c *RequestController) CompleteRequest(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var input services.CompleteRequestInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	req, err := c.reqService.CompleteRequest(ctx.Context(), id, input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 200, req)
}

func (c *RequestController) CancelRequest(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	req, err := c.reqService.CancelRequest(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 200, req)
}

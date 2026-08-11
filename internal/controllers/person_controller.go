package controllers

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

type PersonController struct {
	personService *services.PersonService
}

func NewPersonController(personService *services.PersonService) *PersonController {
	return &PersonController{personService: personService}
}

func (c *PersonController) CreatePerson(ctx *fiber.Ctx) error {
	var input services.CreatePersonInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.SendError(ctx, 400, "BAD_REQUEST", "Invalid JSON payload")
	}

	person, err := c.personService.CreatePerson(ctx.Context(), input)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}

	return utils.SendSuccess(ctx, 201, person)
}

func (c *PersonController) GetPersonByID(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	person, err := c.personService.GetPersonByID(ctx.Context(), id)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			return utils.SendError(ctx, appErr.StatusCode, appErr.Code, appErr.Message)
		}
		return utils.SendError(ctx, 500, "INTERNAL_ERROR", err.Error())
	}
	return utils.SendSuccess(ctx, 200, person)
}

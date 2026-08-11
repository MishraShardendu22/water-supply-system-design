package middleware

import (
	"fmt"

	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/utils"
)

func Recovery() fiber.Handler {
	return func(c *fiber.Ctx) (err error) {
		defer func() {
			if r := recover(); r != nil {
				errStr := fmt.Sprintf("%v", r)
				utils.Error("Panic recovered: %s", errStr)
				err = utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred")
			}
		}()
		return c.Next()
	}
}

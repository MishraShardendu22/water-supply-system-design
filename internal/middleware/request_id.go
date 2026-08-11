package middleware

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/utils"
)

func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		reqID := c.Get("X-Request-ID")
		if reqID == "" {
			var err error
			reqID, err = utils.NewUUIDv7()
			if err != nil {
				reqID = "req-unknown"
			}
		}
		c.Set("X-Request-ID", reqID)
		c.Locals("requestId", reqID)
		return c.Next()
	}
}

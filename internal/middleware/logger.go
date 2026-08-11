package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/utils"
)

func Logger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start)

		status := c.Response().StatusCode()
		method := c.Method()
		path := c.Path()
		ip := c.IP()

		utils.Info("[%s] %d %s %s - %v", ip, status, method, path, duration)

		return err
	}
}

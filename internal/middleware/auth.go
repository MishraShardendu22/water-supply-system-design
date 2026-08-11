package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/utils"
)

func Protected(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.SendError(c, 401, "UNAUTHORIZED", "Missing authorization header")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return utils.SendError(c, 401, "UNAUTHORIZED", "Invalid authorization header format. Expected 'Bearer <token>'")
		}

		claims, err := utils.ValidateToken(parts[1], jwtSecret)
		if err != nil {
			return utils.SendError(c, 401, "UNAUTHORIZED", "Invalid or expired token")
		}

		c.Locals("adminId", claims.AdminID)
		c.Locals("adminEmail", claims.Email)
		c.Locals("adminRole", claims.Role)

		return c.Next()
	}
}

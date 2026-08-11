package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv               string
	AppPort              string
	DatabaseURL          string
	JWTSecret            string
	AdminBootstrapSecret string
	AdminEmail           string
	AdminPassword        string
	JWTExpiration        time.Duration
	OTPExpiration        time.Duration
}

func Load() (*Config, error) {
	// Attempt to load .env file if present
	_ = godotenv.Load()

	cfg := &Config{
		AppEnv:               getEnv("APP_ENV", "development"),
		AppPort:              getEnv("APP_PORT", "8080"),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		JWTSecret:            os.Getenv("JWT_SECRET"),
		AdminBootstrapSecret: getEnv("ADMIN_BOOTSTRAP_SECRET", "bootstrap-secret-key-1234"),
		AdminEmail:           getEnv("ADMIN_EMAIL", "admin@water.gov"),
		AdminPassword:        getEnv("ADMIN_PASSWORD", "AdminPassword123!"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	jwtExpStr := getEnv("JWT_EXPIRATION", "24h")
	jwtExp, err := time.ParseDuration(jwtExpStr)
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION format: %w", err)
	}
	cfg.JWTExpiration = jwtExp

	otpExpStr := getEnv("OTP_EXPIRATION", "15m")
	otpExp, err := time.ParseDuration(otpExpStr)
	if err != nil {
		return nil, fmt.Errorf("invalid OTP_EXPIRATION format: %w", err)
	}
	cfg.OTPExpiration = otpExp

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

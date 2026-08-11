package utils

import (
	"fmt"

	"github.com/google/uuid"
)

func NewUUIDv7() (string, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return "", fmt.Errorf("failed to generate UUIDv7: %w", err)
	}
	return id.String(), nil
}

func ValidateUUID(id string) error {
	_, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid UUID string: %s", id)
	}
	return nil
}

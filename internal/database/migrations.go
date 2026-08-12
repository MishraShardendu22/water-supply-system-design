package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"water-supply-system/internal/utils"
)

func (db *DB) RunMigrations(ctx context.Context, direction string) error {
	var file string
	if direction == "down" {
		file = "migrations/000001_init_schema.down.sql"
	} else {
		file = "migrations/000001_init_schema.up.sql"
	}

	utils.Info("Starting database migration (%s): %s", direction, file)

	sqlBytes, err := os.ReadFile(file)
	if err != nil {
		return fmt.Errorf("failed to read migration file %s: %w", file, err)
	}

	execCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	_, err = db.ExecContext(execCtx, string(sqlBytes))
	if err != nil {
		return fmt.Errorf("failed to execute migration %s: %w", file, err)
	}

	utils.Info("Successfully executed database migration (%s)", direction)
	return nil
}

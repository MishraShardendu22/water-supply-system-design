package database

import (
	"context"
	"fmt"
	"time"

	"water-supply-system/internal/utils"
	"water-supply-system/migrations"
)

func (db *DB) RunMigrations(ctx context.Context, direction string) error {
	var sqlContent string
	var label string

	if direction == "down" {
		sqlContent = migrations.DownSQL
		label = "000001_init_schema.down.sql (embedded)"
	} else {
		sqlContent = migrations.UpSQL
		label = "000001_init_schema.up.sql (embedded)"
	}

	utils.Info("Starting database migration (%s): %s", direction, label)

	if sqlContent == "" {
		return fmt.Errorf("embedded SQL migration content is empty")
	}

	execCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	_, err := db.ExecContext(execCtx, sqlContent)
	if err != nil {
		return fmt.Errorf("failed to execute migration (%s): %w", direction, err)
	}

	utils.Info("Successfully executed database migration (%s)", direction)
	return nil
}

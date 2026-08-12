package main

import (
	"context"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"water-supply-system/internal/config"
	"water-supply-system/internal/database"
	"water-supply-system/internal/utils"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	ctx := context.Background()
	truncateQuery := `TRUNCATE requests, filling_stations, vehicles, drivers, district_managers, drop_off_locations, normal_persons, locations, administrations RESTART IDENTITY CASCADE;`
	_, err = db.ExecContext(ctx, truncateQuery)
	if err != nil {
		log.Fatalf("Failed to truncate database tables: %v", err)
	}

	// Insert fresh default admin
	adminID, _ := utils.NewUUIDv7()
	passHash, _ := utils.HashPassword("AdminPassword123!")
	insertAdminQuery := `
		INSERT INTO administrations (id, name, mail, password_hash, contact_number, role, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err = db.ExecContext(ctx, insertAdminQuery, adminID, "System Admin", "admin@water.gov", passHash, "admin@water.gov", "Admin", time.Now())
	if err != nil {
		log.Fatalf("Failed to re-create default admin: %v", err)
	}

	fmt.Println("DATABASE RESET & TRUNCATED CLEANLY WITH FRESH ADMIN.")
}

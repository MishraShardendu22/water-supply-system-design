package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"water-supply-system/internal/config"
	"water-supply-system/internal/database"
)

func main() {
	direction := flag.String("direction", "up", "Migration direction: up or down")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	var file string
	if *direction == "down" {
		file = "migrations/000001_init_schema.down.sql"
	} else {
		file = "migrations/000001_init_schema.up.sql"
	}

	sqlBytes, err := os.ReadFile(file)
	if err != nil {
		log.Fatalf("Failed to read migration file %s: %v", file, err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_, err = db.ExecContext(ctx, string(sqlBytes))
	if err != nil {
		log.Fatalf("Failed to execute migration %s: %v", file, err)
	}

	fmt.Printf("Successfully executed migration (%s): %s\n", *direction, file)
}

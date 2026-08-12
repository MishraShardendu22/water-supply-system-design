package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"water-supply-system/internal/utils"
	"water-supply-system/pkg/app"
)

func main() {
	fiberApp, cfg, err := app.BuildApp()
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}

	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.AppPort)
		utils.Info("Starting Fiber HTTP server listening on port %s...", cfg.AppPort)
		if err := fiberApp.Listen(addr); err != nil {
			utils.Error("Server shutdown error: %v", err)
		}
	}()

	<-shutdownChan
	utils.Info("Shutdown signal received. Gracefully stopping Fiber server...")

	if err := fiberApp.Shutdown(); err != nil {
		utils.Error("Error during Fiber app shutdown: %v", err)
	}

	utils.Info("Server stopped cleanly")
}

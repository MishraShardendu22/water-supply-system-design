package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/config"
	"water-supply-system/internal/controllers"
	"water-supply-system/internal/database"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/routes"
	"water-supply-system/internal/services"
	"water-supply-system/internal/utils"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	utils.Info("Starting Water Supply Management System Service (ENV: %s)", cfg.AppEnv)

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		utils.Error("Failed to connect to database: %v", err)
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()
	utils.Info("Successfully connected to PostgreSQL database")

	// Repositories
	locationRepo := repositories.NewLocationRepository(db)
	personRepo := repositories.NewPersonRepository(db)
	dmRepo := repositories.NewDistrictManagerRepository(db)
	adminRepo := repositories.NewAdminRepository(db)
	driverRepo := repositories.NewDriverRepository(db)
	vehicleRepo := repositories.NewVehicleRepository(db)
	fsRepo := repositories.NewFillingStationRepository(db)
	reqRepo := repositories.NewRequestRepository(db)

	// Services
	adminService := services.NewAdminService(adminRepo, cfg)
	priorityService := services.NewPriorityService(reqRepo, locationRepo)
	otpService := services.NewOTPService(reqRepo, cfg.OTPExpiration)
	driverService := services.NewDriverService(driverRepo, reqRepo)
	vehicleService := services.NewVehicleService(vehicleRepo)
	fsService := services.NewFillingStationService(fsRepo, locationRepo)
	locationService := services.NewLocationService(locationRepo, driverRepo)
	personService := services.NewPersonService(personRepo, locationRepo)
	dmService := services.NewDistrictManagerService(dmRepo, personRepo, reqRepo)
	requestService := services.NewRequestService(reqRepo, personRepo, locationRepo, driverRepo, vehicleRepo, fsRepo, priorityService, otpService)

	// Bootstrap Admin
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	if err := adminService.BootstrapInitialAdmin(ctx); err != nil {
		utils.Error("Admin bootstrap failed: %v", err)
	}
	cancel()

	// Controllers
	authController := controllers.NewAuthController(adminService)
	adminController := controllers.NewAdminController(adminService)
	driverController := controllers.NewDriverController(driverService)
	vehicleController := controllers.NewVehicleController(vehicleService)
	fsController := controllers.NewFillingStationController(fsService)
	dropOffController := controllers.NewDropOffLocationController(locationService)
	personController := controllers.NewPersonController(personService)
	dmController := controllers.NewDistrictManagerController(dmService)
	requestController := controllers.NewRequestController(requestService)

	app := fiber.New(fiber.Config{
		AppName:               "Water Supply Management System API",
		DisableStartupMessage: false,
	})

	// Setup Routes
	deps := &routes.RouterDependencies{
		Config:                    cfg,
		DistrictManagerController: dmController,
		FillingStationController:  fsController,
		AuthController:            authController,
		AdminController:           adminController,
		PersonController:          personController,
		DriverController:          driverController,
		VehicleController:         vehicleController,
		DropOffLocationController: dropOffController,
		RequestController:         requestController,
	}
	
	routes.SetupRoutes(app, deps)

	// Graceful shutdown channel
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.AppPort)
		utils.Info("Server listening on port %s", cfg.AppPort)
		if err := app.Listen(addr); err != nil {
			utils.Error("Server error: %v", err)
		}
	}()

	<-shutdownChan
	utils.Info("Shutdown signal received, gracefully shutting down server...")

	if err := app.Shutdown(); err != nil {
		utils.Error("Error during Fiber shutdown: %v", err)
	}

	utils.Info("Server stopped cleanly")
}

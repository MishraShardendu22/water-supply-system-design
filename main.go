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
	// 1. Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}
	utils.Info("Configuration loaded successfully (APP_ENV: %s, APP_PORT: %s)", cfg.AppEnv, cfg.AppPort)

	// 2. Establish PostgreSQL connection
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		utils.Error("Failed to connect to database: %v", err)
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()
	utils.Info("Successfully connected to PostgreSQL database")

	// 3. Run pending database migrations automatically before starting server
	migrationCtx, migrationCancel := context.WithTimeout(context.Background(), 30*time.Second)
	if err := db.RunMigrations(migrationCtx, "up"); err != nil {
		migrationCancel()
		utils.Error("Database migration failed on startup: %v", err)
		log.Fatalf("Database migration failed: %v", err)
	}
	migrationCancel()
	utils.Info("Pending database migrations completed successfully")

	// 4. Initialize repositories
	locationRepo := repositories.NewLocationRepository(db)
	personRepo := repositories.NewPersonRepository(db)
	dmRepo := repositories.NewDistrictManagerRepository(db)
	adminRepo := repositories.NewAdminRepository(db)
	driverRepo := repositories.NewDriverRepository(db)
	vehicleRepo := repositories.NewVehicleRepository(db)
	fsRepo := repositories.NewFillingStationRepository(db)
	reqRepo := repositories.NewRequestRepository(db)

	// 5. Initialize services
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

	// Bootstrap Admin account if none exists
	bootstrapCtx, bootstrapCancel := context.WithTimeout(context.Background(), 10*time.Second)
	if err := adminService.BootstrapInitialAdmin(bootstrapCtx); err != nil {
		utils.Error("Admin bootstrap failed: %v", err)
	}
	bootstrapCancel()

	// 6. Initialize controllers & routes
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

	deps := &routes.RouterDependencies{
		Config:                    cfg,
		AuthController:            authController,
		AdminController:           adminController,
		DriverController:          driverController,
		VehicleController:         vehicleController,
		FillingStationController:  fsController,
		DropOffLocationController: dropOffController,
		PersonController:          personController,
		DistrictManagerController: dmController,
		RequestController:         requestController,
	}
	routes.SetupRoutes(app, deps)

	// 7. Setup graceful shutdown channel
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.AppPort)
		utils.Info("Starting Fiber HTTP server listening on port %s...", cfg.AppPort)
		if err := app.Listen(addr); err != nil {
			utils.Error("Server shutdown error: %v", err)
		}
	}()

	<-shutdownChan
	utils.Info("Shutdown signal received. Gracefully stopping Fiber server and closing database connection...")

	if err := app.Shutdown(); err != nil {
		utils.Error("Error during Fiber app shutdown: %v", err)
	}

	utils.Info("Server and database connection stopped cleanly")
}

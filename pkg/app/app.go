package app

import (
	"context"
	"fmt"
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

func BuildApp() (*fiber.App, *config.Config, error) {
	cfg, err := config.Load()
	if err != nil {
		return nil, nil, fmt.Errorf("configuration loading error: %w", err)
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		return nil, nil, fmt.Errorf("database connection error: %w", err)
	}

	migrationCtx, migrationCancel := context.WithTimeout(context.Background(), 30*time.Second)
	if err := db.RunMigrations(migrationCtx, "up"); err != nil {
		migrationCancel()
		return nil, nil, fmt.Errorf("database migration error: %w", err)
	}
	migrationCancel()

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
	adminService := services.NewAdminService(adminRepo, driverRepo, dmRepo, cfg)
	priorityService := services.NewPriorityService(reqRepo, locationRepo)
	otpService := services.NewOTPService(reqRepo, cfg.OTPExpiration)
	driverService := services.NewDriverService(driverRepo, reqRepo)
	vehicleService := services.NewVehicleService(vehicleRepo)
	fsService := services.NewFillingStationService(fsRepo, locationRepo)
	locationService := services.NewLocationService(locationRepo, driverRepo)
	personService := services.NewPersonService(personRepo, locationRepo)
	dmService := services.NewDistrictManagerService(dmRepo, personRepo, reqRepo)
	requestService := services.NewRequestService(reqRepo, personRepo, locationRepo, driverRepo, vehicleRepo, fsRepo, priorityService, otpService)

	// Admin Bootstrap
	bootstrapCtx, bootstrapCancel := context.WithTimeout(context.Background(), 10*time.Second)
	if err := adminService.BootstrapInitialAdmin(bootstrapCtx); err != nil {
		utils.Error("Admin bootstrap warning: %v", err)
	}
	bootstrapCancel()

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

	fiberApp := fiber.New(fiber.Config{
		AppName:               "Water Supply Management System API",
		DisableStartupMessage: true,
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
	routes.SetupRoutes(fiberApp, deps)

	return fiberApp, cfg, nil
}

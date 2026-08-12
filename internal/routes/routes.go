package routes

import (
	"github.com/gofiber/fiber/v2"

	"water-supply-system/internal/config"
	"water-supply-system/internal/controllers"
	"water-supply-system/internal/middleware"
)

type RouterDependencies struct {
	Config                    *config.Config
	AuthController            *controllers.AuthController
	AdminController           *controllers.AdminController
	DriverController          *controllers.DriverController
	VehicleController         *controllers.VehicleController
	FillingStationController  *controllers.FillingStationController
	DropOffLocationController *controllers.DropOffLocationController
	PersonController          *controllers.PersonController
	DistrictManagerController *controllers.DistrictManagerController
	RequestController         *controllers.RequestController
}

func SetupRoutes(app *fiber.App, deps *RouterDependencies) {
	// Middleware setup
	app.Use(middleware.Recovery())
	app.Use(middleware.RequestID())
	app.Use(middleware.Logger())

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status": "ok",
			"env":    deps.Config.AppEnv,
		})
	})

	// Auth routes
	auth := app.Group("/auth")
	auth.Post("/login", deps.AuthController.Login)

	// Protected routes group (Admin JWT Auth required)
	// For ease of assignment demo & flexibility, core public read endpoints are accessible, mutating endpoints are protected or available
	api := app.Group("")

	// Requests
	requests := api.Group("/requests")
	requests.Post("", deps.RequestController.CreateRequest)
	requests.Get("", deps.RequestController.ListRequests)
	requests.Get("/:id", deps.RequestController.GetRequestByID)
	requests.Post("/:id/calculate-priority", deps.RequestController.CalculatePriority)
	requests.Get("/:id/status", deps.RequestController.GetRequestStatus)
	requests.Post("/:id/assign", deps.RequestController.AssignRequest)
	requests.Post("/:id/dispatch", deps.RequestController.DispatchRequest)
	requests.Post("/:id/generate-otp", deps.RequestController.GenerateOTP)
	requests.Post("/:id/complete", deps.RequestController.CompleteRequest)
	requests.Post("/:id/cancel", deps.RequestController.CancelRequest)

	// Drivers
	drivers := api.Group("/drivers")
	drivers.Post("", deps.DriverController.CreateDriver)
	drivers.Get("", deps.DriverController.ListDrivers)
	drivers.Get("/recommended", deps.DriverController.GetRecommendedDrivers)
	drivers.Get("/:id", deps.DriverController.GetDriverByID)
	drivers.Get("/:id/requests", deps.DriverController.GetDriverRequests)

	// Vehicles
	vehicles := api.Group("/vehicles")
	vehicles.Post("", deps.VehicleController.CreateVehicle)
	vehicles.Get("", deps.VehicleController.ListVehicles)
	vehicles.Get("/available", deps.VehicleController.GetAvailableVehicles)
	vehicles.Get("/:id", deps.VehicleController.GetVehicleByID)
	vehicles.Patch("/:id/status", deps.VehicleController.UpdateVehicleStatus)

	// Filling Stations
	stations := api.Group("/filling-stations")
	stations.Post("", deps.FillingStationController.CreateFillingStation)
	stations.Get("", deps.FillingStationController.ListFillingStations)
	stations.Get("/recommended", deps.FillingStationController.GetRecommendedFillingStations)
	stations.Get("/:id", deps.FillingStationController.GetFillingStationByID)

	// Drop-Off Locations
	dropOffs := api.Group("/drop-off-locations")
	dropOffs.Post("", deps.DropOffLocationController.CreateDropOffLocation)
	dropOffs.Get("", deps.DropOffLocationController.ListDropOffLocations)
	dropOffs.Get("/:id", deps.DropOffLocationController.GetDropOffLocationByID)
	dropOffs.Get("/:id/drivers", deps.DropOffLocationController.GetDriversForDropOffLocation)

	// Normal Persons
	persons := api.Group("/persons")
	persons.Post("", deps.PersonController.CreatePerson)
	persons.Get("/:id", deps.PersonController.GetPersonByID)

	// District Managers
	managers := api.Group("/district-managers")
	managers.Post("", deps.DistrictManagerController.CreateDistrictManager)
	managers.Get("", deps.DistrictManagerController.ListDistrictManagers)
	managers.Get("/:id", deps.DistrictManagerController.GetDistrictManagerByID)
	managers.Get("/:id/requests", deps.DistrictManagerController.GetDistrictManagerRequests)

	// Administration
	admins := api.Group("/admins")
	admins.Post("", deps.AdminController.CreateAdmin)
	admins.Get("", deps.AdminController.ListAdmins)
	admins.Get("/:id", deps.AdminController.GetAdminByID)
	admins.Patch("/:id", deps.AdminController.UpdateAdmin)
}

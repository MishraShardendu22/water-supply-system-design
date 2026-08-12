package handler

import (
	"net/http"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"

	"water-supply-system/internal/app"
)

var (
	fiberApp *fiber.App
	initOnce sync.Once
	initErr  error
)

func Handler(w http.ResponseWriter, r *http.Request) {
	initOnce.Do(func() {
		fiberApp, _, initErr = app.BuildApp()
	})

	if initErr != nil {
		http.Error(w, "Vercel Serverless Initialization Error: "+initErr.Error(), http.StatusInternalServerError)
		return
	}

	adaptor.FiberApp(fiberApp)(w, r)
}

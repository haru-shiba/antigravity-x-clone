package routes

import (
	"x-clone-backend/controllers"
	"x-clone-backend/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterDMRoutes(r *gin.Engine) {
	dms := r.Group("/dms")
	dms.Use(middleware.JwtAuthMiddleware())
	{
		dms.GET("/", controllers.GetDMs)
		dms.GET("/:id", controllers.GetDMsWithUser)
		dms.POST("/", controllers.SendDM)
	}
}

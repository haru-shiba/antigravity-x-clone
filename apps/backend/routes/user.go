package routes

import (
	"x-clone-backend/controllers"
	"x-clone-backend/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.Engine) {
	user := r.Group("/user")
	user.Use(middleware.JwtAuthMiddleware())
	{
		user.GET("/profile", controllers.GetProfile)
		user.DELETE("/delete", controllers.DeleteAccount)
	}
}

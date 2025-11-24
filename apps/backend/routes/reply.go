package routes

import (
	"x-clone-backend/controllers"
	"x-clone-backend/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterReplyRoutes(r *gin.Engine) {
	// Nested under tweets
	tweets := r.Group("/tweets")
	{
		tweets.GET("/:id/replies", controllers.GetReplies)
		
		protected := tweets.Group("/")
		protected.Use(middleware.JwtAuthMiddleware())
		{
			protected.POST("/:id/replies", controllers.CreateReply)
		}
	}
}

package routes

import (
	"x-clone-backend/controllers"
	"x-clone-backend/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterTweetRoutes(r *gin.Engine) {
	tweets := r.Group("/tweets")
	// Public routes
	tweets.GET("/", controllers.GetTweets)
	tweets.GET("/:id", controllers.GetTweet)

	// Protected routes
	tweets.Use(middleware.JwtAuthMiddleware())
	{
		tweets.POST("/", controllers.CreateTweet)
		tweets.DELETE("/:id", controllers.DeleteTweet)
	}
}

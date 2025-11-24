package routes

import (
	"x-clone-backend/controllers"
	"x-clone-backend/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterBookmarkRoutes(r *gin.Engine) {
	bookmarks := r.Group("/bookmarks")
	bookmarks.Use(middleware.JwtAuthMiddleware())
	{
		bookmarks.GET("/", controllers.GetBookmarks)
		bookmarks.POST("/:id", controllers.AddBookmark)
		bookmarks.DELETE("/:id", controllers.RemoveBookmark)
	}
}

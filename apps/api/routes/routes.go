package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/handlers"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/middlewares"
)

func SetupRoutes(router *gin.Engine, userHandler *handlers.UserHandler, authHandler *handlers.AuthHandler, postHandler *handlers.PostHandler, likeHandler *handlers.LikeHandler, bookmarkHandler *handlers.BookmarkHandler, authMiddleware *middlewares.AuthMiddleware) {
	api := router.Group("/api")
	{
		api.POST("/users", userHandler.CreateUser)
		api.POST("/login", authHandler.Login)

		authorized := api.Group("/")
		authorized.Use(authMiddleware.Handle())
		{
			authorized.GET("/users/:username", userHandler.GetProfile)
			authorized.GET("/me", userHandler.GetMe)
			authorized.POST("/posts", postHandler.CreatePost)
			authorized.GET("/posts", postHandler.GetTimeline)
			authorized.POST("/posts/:id/like", likeHandler.ToggleLike)
			authorized.POST("/posts/:id/bookmark", bookmarkHandler.ToggleBookmark)
			authorized.GET("/bookmarks", postHandler.GetBookmarks)
			authorized.GET("/posts/:id", postHandler.GetPostDetail)
			authorized.GET("/posts/:id/replies", postHandler.GetReplies)
			authorized.DELETE("/posts/:id", postHandler.DeletePost)
		}
	}
}

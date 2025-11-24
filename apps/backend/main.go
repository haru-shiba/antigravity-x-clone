package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"x-clone-backend/db"
	"x-clone-backend/middleware"
	"x-clone-backend/models"
	"x-clone-backend/routes"
)

func main() {
	db.ConnectDatabase()
	db.DB.AutoMigrate(&models.User{}, &models.Tweet{}, &models.Reply{}, &models.Bookmark{}, &models.DM{})

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	
	routes.RegisterAuthRoutes(r)
	routes.RegisterUserRoutes(r)
	routes.RegisterTweetRoutes(r)
	routes.RegisterReplyRoutes(r)
	routes.RegisterBookmarkRoutes(r)
	routes.RegisterDMRoutes(r)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080
}

package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	infraAuth "github.com/taiji-shibata/antigravity-x-clone/apps/api/infrastructures/auth"
	infraRepos "github.com/taiji-shibata/antigravity-x-clone/apps/api/infrastructures/repositories"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/handlers"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/middlewares"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/routes"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/auth"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/bookmark"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/like"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/post"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/user"
)

func main() {
	// Database connection
	dsn := "host=localhost user=user password=password dbname=x_clone port=5433 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Migration
	// Auto Migrate
	if err := db.AutoMigrate(&models.User{}, &models.Post{}, &models.Like{}, &models.Bookmark{}); err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	// Redis connection
	sessionManager := infraAuth.NewSessionManager("localhost:6379", "", 0)

	// Repositories
	userRepo := infraRepos.NewUserRepository(db)
	postRepo := infraRepos.NewPostRepository(db)
	likeRepo := infraRepos.NewLikeRepository(db)
	bookmarkRepo := infraRepos.NewBookmarkRepository(db)

	// UseCases
	createUserUC := user.NewCreateUserUseCase(userRepo)
	getUserProfileUC := user.NewGetUserProfileUseCase(userRepo)
	getMeUC := user.NewGetMeUseCase(userRepo)
	loginUC := auth.NewLoginUseCase(userRepo, sessionManager)
	createPostUC := post.NewCreatePostUseCase(postRepo, userRepo)
	getTimelineUC := post.NewGetTimelineUseCase(postRepo, likeRepo, bookmarkRepo)
	getBookmarksUC := post.NewGetBookmarksUseCase(postRepo, likeRepo, bookmarkRepo)
	deletePostUC := post.NewDeletePostUseCase(postRepo)
	getPostDetailUC := post.NewGetPostDetailUseCase(postRepo, userRepo, likeRepo, bookmarkRepo)
	getRepliesUC := post.NewGetRepliesUseCase(postRepo, userRepo, likeRepo, bookmarkRepo)
	toggleLikeUC := like.NewToggleLikeUseCase(likeRepo)
	toggleBookmarkUC := bookmark.NewToggleBookmarkUseCase(bookmarkRepo)

	// Handlers
	userHandler := handlers.NewUserHandler(createUserUC, getUserProfileUC, getMeUC)
	authHandler := handlers.NewAuthHandler(loginUC)
	postHandler := handlers.NewPostHandler(createPostUC, getTimelineUC, getBookmarksUC, deletePostUC, getPostDetailUC, getRepliesUC)
	likeHandler := handlers.NewLikeHandler(toggleLikeUC)
	bookmarkHandler := handlers.NewBookmarkHandler(toggleBookmarkUC)

	// Middlewares
	authMiddleware := middlewares.NewAuthMiddleware(sessionManager)

	// Router
	router := gin.Default()

	// CORS Configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	routes.SetupRoutes(router, userHandler, authHandler, postHandler, likeHandler, bookmarkHandler, authMiddleware)

	// Start server
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

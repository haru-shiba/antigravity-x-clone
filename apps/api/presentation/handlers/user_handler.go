package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	domainErrors "github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/errors"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/requests"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/responses"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/user"
)

type UserHandler struct {
	createUserUC     *user.CreateUserUseCase
	getUserProfileUC *user.GetUserProfileUseCase
	getMeUC          *user.GetMeUseCase
}

func NewUserHandler(createUserUC *user.CreateUserUseCase, getUserProfileUC *user.GetUserProfileUseCase, getMeUC *user.GetMeUseCase) *UserHandler {
	return &UserHandler{
		createUserUC:     createUserUC,
		getUserProfileUC: getUserProfileUC,
		getMeUC:          getMeUC,
	}
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var req requests.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := user.CreateUserInput{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
	}

	output, err := h.createUserUC.Execute(c.Request.Context(), input)
	if err != nil {
		if errors.Is(err, domainErrors.ErrUserAlreadyExists) { // Updated error handling
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, domainErrors.ErrInvalidInput) { // Updated error handling
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"}) // Updated default error message
		return
	}

	c.JSON(http.StatusCreated, responses.ToUserResponse(output.User)) // Simplified response
}

func (h *UserHandler) GetProfile(c *gin.Context) { // Added new method
	username := c.Param("username")
	user, err := h.getUserProfileUC.Execute(c.Request.Context(), username)
	if err != nil {
		if errors.Is(err, domainErrors.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, responses.ToUserResponse(user))
}

func (h *UserHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := h.getMeUC.Execute(c.Request.Context(), userID.(uint))
	if err != nil {
		if errors.Is(err, domainErrors.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, responses.ToUserResponse(user))
}

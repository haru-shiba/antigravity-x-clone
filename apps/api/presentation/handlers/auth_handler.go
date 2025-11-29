package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	domainErrors "github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/errors"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/responses"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/auth"
)

type AuthHandler struct {
	loginUC *auth.LoginUseCase
}

func NewAuthHandler(loginUC *auth.LoginUseCase) *AuthHandler {
	return &AuthHandler{
		loginUC: loginUC,
	}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := auth.LoginInput{
		Email:    req.Email,
		Password: req.Password,
	}

	output, err := h.loginUC.Execute(c.Request.Context(), input)
	if err != nil {
		switch err {
		case domainErrors.ErrUserNotFound, domainErrors.ErrInvalidInput:
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Set Cookie
	// Name, Value, MaxAge, Path, Domain, Secure, HttpOnly
	c.SetCookie("session_id", output.SessionID, 3600*24, "/", "", false, true) // Secure false for dev

	res := responses.ToUserResponse(output.User)
	c.JSON(http.StatusOK, res)
}

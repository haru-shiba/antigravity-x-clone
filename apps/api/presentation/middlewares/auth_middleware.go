package middlewares

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	infraAuth "github.com/taiji-shibata/antigravity-x-clone/apps/api/infrastructures/auth"
)

type AuthMiddleware struct {
	sessionManager *infraAuth.SessionManager
}

func NewAuthMiddleware(sessionManager *infraAuth.SessionManager) *AuthMiddleware {
	return &AuthMiddleware{
		sessionManager: sessionManager,
	}
}

func (m *AuthMiddleware) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID, err := c.Cookie("session_id")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userIDStr, err := m.sessionManager.Get(c.Request.Context(), "session:"+sessionID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userID, err := strconv.ParseUint(userIDStr, 10, 64)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			return
		}

		c.Set("userID", uint(userID))
		c.Next()
	}
}

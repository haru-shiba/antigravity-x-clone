package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/like"
)

type LikeHandler struct {
	toggleLikeUC *like.ToggleLikeUseCase
}

func NewLikeHandler(toggleLikeUC *like.ToggleLikeUseCase) *LikeHandler {
	return &LikeHandler{toggleLikeUC: toggleLikeUC}
}

func (h *LikeHandler) ToggleLike(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := strconv.ParseUint(postIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	output, err := h.toggleLikeUC.Execute(c.Request.Context(), userID.(uint), uint(postID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, output)
}

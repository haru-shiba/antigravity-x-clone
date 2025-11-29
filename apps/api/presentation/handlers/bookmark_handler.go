package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/bookmark"
)

type BookmarkHandler struct {
	toggleBookmarkUC *bookmark.ToggleBookmarkUseCase
}

func NewBookmarkHandler(toggleBookmarkUC *bookmark.ToggleBookmarkUseCase) *BookmarkHandler {
	return &BookmarkHandler{toggleBookmarkUC: toggleBookmarkUC}
}

func (h *BookmarkHandler) ToggleBookmark(c *gin.Context) {
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

	output, err := h.toggleBookmarkUC.Execute(c.Request.Context(), userID.(uint), uint(postID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, output)
}

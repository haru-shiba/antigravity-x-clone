package controllers

import (
	"net/http"
	"strconv"
	"x-clone-backend/db"
	"x-clone-backend/models"
	"x-clone-backend/utils"

	"github.com/gin-gonic/gin"
)

func AddBookmark(c *gin.Context) {
	tweetID := c.Param("id")
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	tid, err := strconv.ParseUint(tweetID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tweet ID"})
		return
	}

	bookmark := models.Bookmark{
		UserID:  userID,
		TweetID: uint(tid),
	}

	if err := db.DB.Create(&bookmark).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already bookmarked or error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bookmarked"})
}

func RemoveBookmark(c *gin.Context) {
	tweetID := c.Param("id")
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	if err := db.DB.Where("user_id = ? AND tweet_id = ?", userID, tweetID).Delete(&models.Bookmark{}).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to remove bookmark"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bookmark removed"})
}

func GetBookmarks(c *gin.Context) {
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	var bookmarks []models.Bookmark
	if err := db.DB.Where("user_id = ?", userID).Preload("Tweet").Preload("Tweet.User").Find(&bookmarks).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch bookmarks"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookmarks": bookmarks})
}

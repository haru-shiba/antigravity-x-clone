package controllers

import (
	"net/http"
	"x-clone-backend/db"
	"x-clone-backend/models"
	"x-clone-backend/utils"

	"github.com/gin-gonic/gin"
)

type CreateTweetInput struct {
	Content string `json:"content" binding:"required"`
}

func CreateTweet(c *gin.Context) {
	var input CreateTweetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	tweet := models.Tweet{
		UserID:  userID,
		Content: input.Content,
	}

	if err := db.DB.Create(&tweet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tweet created", "tweet": tweet})
}

func GetTweets(c *gin.Context) {
	var tweets []models.Tweet
	// Preload User to get author info
	if err := db.DB.Preload("User").Order("created_at desc").Find(&tweets).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch tweets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tweets": tweets})
}

func GetTweet(c *gin.Context) {
	tweetID := c.Param("id")
	var tweet models.Tweet
	if err := db.DB.Preload("User").First(&tweet, tweetID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tweet not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tweet": tweet})
}

func DeleteTweet(c *gin.Context) {
	tweetID := c.Param("id")
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	var tweet models.Tweet
	if err := db.DB.First(&tweet, tweetID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tweet not found"})
		return
	}

	if tweet.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own tweets"})
		return
	}

	if err := db.DB.Delete(&tweet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete tweet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tweet deleted"})
}

package controllers

import (
	"net/http"
	"strconv"
	"x-clone-backend/db"
	"x-clone-backend/models"
	"x-clone-backend/utils"

	"github.com/gin-gonic/gin"
)

type CreateReplyInput struct {
	Content string `json:"content" binding:"required"`
}

func CreateReply(c *gin.Context) {
	tweetID := c.Param("id")
	var input CreateReplyInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

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

	reply := models.Reply{
		UserID:  userID,
		TweetID: uint(tid),
		Content: input.Content,
	}

	if err := db.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reply created", "reply": reply})
}

func GetReplies(c *gin.Context) {
	tweetID := c.Param("id")
	var replies []models.Reply

	if err := db.DB.Where("tweet_id = ?", tweetID).Preload("User").Order("created_at asc").Find(&replies).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch replies"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"replies": replies})
}

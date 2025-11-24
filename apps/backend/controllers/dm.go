package controllers

import (
	"net/http"
	"strconv"
	"x-clone-backend/db"
	"x-clone-backend/models"
	"x-clone-backend/utils"

	"github.com/gin-gonic/gin"
)

type SendDMInput struct {
	ReceiverID uint   `json:"receiver_id" binding:"required"`
	Content    string `json:"content" binding:"required"`
}

func SendDM(c *gin.Context) {
	var input SendDMInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	senderID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	if senderID == input.ReceiverID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot send DM to yourself"})
		return
	}

	dm := models.DM{
		SenderID:   senderID,
		ReceiverID: input.ReceiverID,
		Content:    input.Content,
	}

	if err := db.DB.Create(&dm).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "DM sent", "dm": dm})
}

func GetDMs(c *gin.Context) {
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	// Get DMs where user is sender OR receiver
	var dms []models.DM
	if err := db.DB.Where("sender_id = ? OR receiver_id = ?", userID, userID).Preload("Sender").Preload("Receiver").Order("created_at desc").Find(&dms).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch DMs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"dms": dms})
}

func GetDMsWithUser(c *gin.Context) {
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}
	
	otherUserIDStr := c.Param("id")
	otherUserID, err := strconv.ParseUint(otherUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var dms []models.DM
	if err := db.DB.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", userID, otherUserID, otherUserID, userID).Preload("Sender").Preload("Receiver").Order("created_at asc").Find(&dms).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch DMs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"dms": dms})
}

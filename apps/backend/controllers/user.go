package controllers

import (
	"net/http"
	"x-clone-backend/db"
	"x-clone-backend/models"
	"x-clone-backend/utils"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	var u models.User
	if err := db.DB.First(&u, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": u})
}

func DeleteAccount(c *gin.Context) {
	userID, err := utils.ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	if err := db.DB.Delete(&models.User{}, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account deleted"})
}

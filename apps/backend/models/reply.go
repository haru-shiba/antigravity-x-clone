package models

import (
	"time"
)

type Reply struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TweetID   uint      `json:"tweet_id"`
	Tweet     Tweet     `json:"tweet" gorm:"foreignKey:TweetID;constraint:OnDelete:CASCADE;"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

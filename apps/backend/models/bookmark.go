package models

import (
	"time"
)

type Bookmark struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	TweetID   uint      `json:"tweet_id"`
	Tweet     Tweet     `json:"tweet" gorm:"foreignKey:TweetID;constraint:OnDelete:CASCADE;"`
	CreatedAt time.Time `json:"created_at"`
}

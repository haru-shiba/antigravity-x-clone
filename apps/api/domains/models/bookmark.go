package models

import "time"

type Bookmark struct {
	UserID    uint      `gorm:"primaryKey" json:"user_id"`
	PostID    uint      `gorm:"primaryKey" json:"post_id"`
	CreatedAt time.Time `json:"created_at"`
}

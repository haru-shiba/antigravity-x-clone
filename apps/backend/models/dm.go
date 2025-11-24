package models

import (
	"time"
)

type DM struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	SenderID   uint      `json:"sender_id"`
	Sender     User      `json:"sender" gorm:"foreignKey:SenderID"`
	ReceiverID uint      `json:"receiver_id"`
	Receiver   User      `json:"receiver" gorm:"foreignKey:ReceiverID"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
}

package models

import (
	"time"
)

type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Content   string    `json:"content"`
	AuthorID  uint      `gorm:"not null" json:"author_id"`
	Author    User      `gorm:"foreignKey:AuthorID" json:"author"`
	ParentID  *uint     `json:"parent_id"`
	Parent    *Post     `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Replies   []Post    `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
	RepostID  *uint     `json:"repost_id"`
	Repost    *Post     `gorm:"foreignKey:RepostID" json:"repost,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	IsLiked       bool      `gorm:"-" json:"is_liked"`
	LikeCount     int64     `gorm:"-" json:"like_count"`
	IsBookmarked  bool      `gorm:"-" json:"is_bookmarked"`
	BookmarkCount int64     `gorm:"-" json:"bookmark_count"`
	ReplyCount    int64     `gorm:"-" json:"reply_count"`
	RepostCount   int64     `gorm:"-" json:"repost_count"`
	IsReposted    bool      `gorm:"-" json:"is_reposted"`
}

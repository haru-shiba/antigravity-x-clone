package responses

import (
	"time"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
)

type PostResponse struct {
	ID        uint          `json:"id"`
	Content   string        `json:"content"`
	Author    UserResponse  `json:"author"`
	ParentID  *uint         `json:"parent_id,omitempty"`
	RepostID  *uint         `json:"repost_id,omitempty"`
	Repost    *PostResponse `json:"repost,omitempty"`
	LikeCount     int64         `json:"like_count"`
	IsLiked       bool          `json:"is_liked"`
	BookmarkCount int64         `json:"bookmark_count"`
	IsBookmarked  bool          `json:"is_bookmarked"`
	ReplyCount    int64         `json:"reply_count"`
	RepostCount   int64         `json:"repost_count"`
	IsReposted    bool          `json:"is_reposted"`
	CreatedAt     time.Time     `json:"created_at"`
}

func ToPostResponse(post *models.Post, likeCount int64, isLiked bool, bookmarkCount int64, isBookmarked bool) PostResponse {
	var repost *PostResponse
	if post.Repost != nil {
		// Recursively convert repost. Note: Repost's counts/status should be passed if available.
		// Since we populated them in the model in GetTimelineUseCase/GetBookmarksUseCase, we can use them.
		// But here we are passing 0/false placeholders for the recursive call in the original code.
		// We should probably use post.Repost.ReplyCount etc.
		// For now, let's just fix ReplyCount.
		r := ToPostResponse(post.Repost, post.Repost.LikeCount, post.Repost.IsLiked, post.Repost.BookmarkCount, post.Repost.IsBookmarked)
		repost = &r
	}

	return PostResponse{
		ID:            post.ID,
		Content:       post.Content,
		Author:        ToUserResponse(&post.Author),
		ParentID:      post.ParentID,
		RepostID:      post.RepostID,
		Repost:        repost,
		LikeCount:     likeCount,
		IsLiked:       isLiked,
		BookmarkCount: bookmarkCount,
		IsBookmarked:  isBookmarked,
		ReplyCount:    post.ReplyCount,
		RepostCount:   post.RepostCount,
		IsReposted:    post.IsReposted,
		CreatedAt:     post.CreatedAt,
	}
}

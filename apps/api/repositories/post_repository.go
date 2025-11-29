package repositories

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
)

type PostRepository interface {
	Create(ctx context.Context, post *models.Post) error
	List(ctx context.Context, limit, offset int, targetUserID *uint) ([]*models.Post, error)
	GetBookmarkedPosts(ctx context.Context, userID uint, limit, offset int) ([]*models.Post, error)
	CountReplies(ctx context.Context, postID uint) (int64, error)
	CountReposts(ctx context.Context, postID uint) (int64, error)
	CheckReposted(ctx context.Context, userID uint, postID uint) (bool, error)
	GetReplies(ctx context.Context, postID uint) ([]*models.Post, error)
	Delete(ctx context.Context, postID uint) error
	FindByID(ctx context.Context, postID uint) (*models.Post, error)
}

package repositories

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
)

type LikeRepository interface {
	Create(ctx context.Context, like *models.Like) error
	Delete(ctx context.Context, userID, postID uint) error
	Exists(ctx context.Context, userID, postID uint) (bool, error)
	CountByPostID(ctx context.Context, postID uint) (int64, error)
}

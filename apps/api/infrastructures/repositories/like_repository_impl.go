package repositories

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
	"gorm.io/gorm"
)

type LikeRepositoryImpl struct {
	db *gorm.DB
}

func NewLikeRepository(db *gorm.DB) repositories.LikeRepository {
	return &LikeRepositoryImpl{db: db}
}

func (r *LikeRepositoryImpl) Create(ctx context.Context, like *models.Like) error {
	return r.db.WithContext(ctx).Create(like).Error
}

func (r *LikeRepositoryImpl) Delete(ctx context.Context, userID, postID uint) error {
	return r.db.WithContext(ctx).Delete(&models.Like{}, "user_id = ? AND post_id = ?", userID, postID).Error
}

func (r *LikeRepositoryImpl) Exists(ctx context.Context, userID, postID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Like{}).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *LikeRepositoryImpl) CountByPostID(ctx context.Context, postID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Like{}).
		Where("post_id = ?", postID).
		Count(&count).Error
	return count, err
}

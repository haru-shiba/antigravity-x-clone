package repositories

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
	"gorm.io/gorm"
)

type BookmarkRepositoryImpl struct {
	db *gorm.DB
}

func NewBookmarkRepository(db *gorm.DB) repositories.BookmarkRepository {
	return &BookmarkRepositoryImpl{db: db}
}

func (r *BookmarkRepositoryImpl) Create(ctx context.Context, bookmark *models.Bookmark) error {
	return r.db.WithContext(ctx).Create(bookmark).Error
}

func (r *BookmarkRepositoryImpl) Delete(ctx context.Context, userID, postID uint) error {
	return r.db.WithContext(ctx).Delete(&models.Bookmark{}, "user_id = ? AND post_id = ?", userID, postID).Error
}

func (r *BookmarkRepositoryImpl) Exists(ctx context.Context, userID, postID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Bookmark{}).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *BookmarkRepositoryImpl) CountByPostID(ctx context.Context, postID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Bookmark{}).
		Where("post_id = ?", postID).
		Count(&count).Error
	return count, err
}

package repositories

import (
	"context"

	"gorm.io/gorm"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type postRepositoryImpl struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) repositories.PostRepository {
	return &postRepositoryImpl{db: db}
}

func (r *postRepositoryImpl) Create(ctx context.Context, post *models.Post) error {
	return r.db.WithContext(ctx).Create(post).Error
}

func (r *postRepositoryImpl) List(ctx context.Context, limit, offset int, targetUserID *uint) ([]*models.Post, error) {
	var posts []*models.Post
	query := r.db.WithContext(ctx).
		Preload("Author").
		Preload("Repost").
		Preload("Repost.Author").
		Order("created_at desc").
		Limit(limit).
		Offset(offset)

	if targetUserID != nil {
		// Wait, if I want to show reposts by this user, I should check author_id.
		// The query above is redundant. `author_id = ?` covers both regular posts and reposts created by this user.
		// So just `Where("author_id = ?", *targetUserID)` is enough.
		query = query.Where("author_id = ?", *targetUserID)
	} else {
		// Only show top-level posts in main timeline
		query = query.Where("parent_id IS NULL")
	}

	err := query.Find(&posts).Error
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepositoryImpl) GetBookmarkedPosts(ctx context.Context, userID uint, limit, offset int) ([]*models.Post, error) {
	var posts []*models.Post
	err := r.db.WithContext(ctx).
		Joins("JOIN bookmarks ON bookmarks.post_id = posts.id").
		Where("bookmarks.user_id = ?", userID).
		Preload("Author").
		Preload("Repost").
		Preload("Repost.Author").
		Order("bookmarks.created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	if err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepositoryImpl) CountReplies(ctx context.Context, postID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Post{}).Where("parent_id = ?", postID).Count(&count).Error
	return count, err
}

func (r *postRepositoryImpl) CountReposts(ctx context.Context, postID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Post{}).Where("repost_id = ?", postID).Count(&count).Error
	return count, err
}

func (r *postRepositoryImpl) CheckReposted(ctx context.Context, userID uint, postID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Post{}).
		Where("author_id = ? AND repost_id = ?", userID, postID).
		Count(&count).Error
	return count > 0, err
}

func (r *postRepositoryImpl) GetReplies(ctx context.Context, postID uint) ([]*models.Post, error) {
	var replies []*models.Post
	err := r.db.WithContext(ctx).
		Where("parent_id = ?", postID).
		Preload("Author").
		Order("created_at asc").
		Find(&replies).Error
	return replies, err
}

func (r *postRepositoryImpl) Delete(ctx context.Context, postID uint) error {
	return r.db.WithContext(ctx).Delete(&models.Post{}, postID).Error
}

func (r *postRepositoryImpl) FindByID(ctx context.Context, postID uint) (*models.Post, error) {
	var post models.Post
	err := r.db.WithContext(ctx).First(&post, postID).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

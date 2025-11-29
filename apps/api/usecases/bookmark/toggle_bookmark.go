package bookmark

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type ToggleBookmarkUseCase struct {
	bookmarkRepo repositories.BookmarkRepository
}

func NewToggleBookmarkUseCase(bookmarkRepo repositories.BookmarkRepository) *ToggleBookmarkUseCase {
	return &ToggleBookmarkUseCase{bookmarkRepo: bookmarkRepo}
}

type ToggleBookmarkOutput struct {
	IsBookmarked   bool  `json:"is_bookmarked"`
	BookmarkCount int64 `json:"bookmark_count"`
}

func (uc *ToggleBookmarkUseCase) Execute(ctx context.Context, userID, postID uint) (*ToggleBookmarkOutput, error) {
	exists, err := uc.bookmarkRepo.Exists(ctx, userID, postID)
	if err != nil {
		return nil, err
	}

	if exists {
		if err := uc.bookmarkRepo.Delete(ctx, userID, postID); err != nil {
			return nil, err
		}
	} else {
		bookmark := &models.Bookmark{
			UserID: userID,
			PostID: postID,
		}
		if err := uc.bookmarkRepo.Create(ctx, bookmark); err != nil {
			return nil, err
		}
	}

	// Fetch updated count
	count, err := uc.bookmarkRepo.CountByPostID(ctx, postID)
	if err != nil {
		return nil, err
	}

	return &ToggleBookmarkOutput{
		IsBookmarked:   !exists,
		BookmarkCount: count,
	}, nil
}

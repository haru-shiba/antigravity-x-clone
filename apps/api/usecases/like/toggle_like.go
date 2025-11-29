package like

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type ToggleLikeUseCase struct {
	likeRepo repositories.LikeRepository
}

func NewToggleLikeUseCase(likeRepo repositories.LikeRepository) *ToggleLikeUseCase {
	return &ToggleLikeUseCase{likeRepo: likeRepo}
}

type ToggleLikeOutput struct {
	IsLiked   bool  `json:"is_liked"`
	LikeCount int64 `json:"like_count"`
}

func (uc *ToggleLikeUseCase) Execute(ctx context.Context, userID, postID uint) (*ToggleLikeOutput, error) {
	exists, err := uc.likeRepo.Exists(ctx, userID, postID)
	if err != nil {
		return nil, err
	}

	if exists {
		if err := uc.likeRepo.Delete(ctx, userID, postID); err != nil {
			return nil, err
		}
	} else {
		like := &models.Like{
			UserID: userID,
			PostID: postID,
		}
		if err := uc.likeRepo.Create(ctx, like); err != nil {
			return nil, err
		}
	}

	// Fetch updated count
	count, err := uc.likeRepo.CountByPostID(ctx, postID)
	if err != nil {
		return nil, err
	}

	return &ToggleLikeOutput{
		IsLiked:   !exists,
		LikeCount: count,
	}, nil
}

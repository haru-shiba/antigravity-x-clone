package post

import (
	"context"

	domainErrors "github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/errors"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type DeletePostUseCase struct {
	postRepo repositories.PostRepository
}

func NewDeletePostUseCase(postRepo repositories.PostRepository) *DeletePostUseCase {
	return &DeletePostUseCase{
		postRepo: postRepo,
	}
}

func (uc *DeletePostUseCase) Execute(ctx context.Context, postID uint, userID uint) error {
	// Check if post exists
	post, err := uc.postRepo.FindByID(ctx, postID)
	if err != nil {
		return err
	}

	// Check if user is the author
	if post.AuthorID != userID {
		return domainErrors.ErrUnauthorized
	}

	// Delete post
	return uc.postRepo.Delete(ctx, postID)
}

package post

import (
	"context"
	"unicode/utf8"

	domainErrors "github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/errors"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type CreatePostUseCase struct {
	postRepo repositories.PostRepository
	userRepo repositories.UserRepository
}

func NewCreatePostUseCase(postRepo repositories.PostRepository, userRepo repositories.UserRepository) *CreatePostUseCase {
	return &CreatePostUseCase{
		postRepo: postRepo,
		userRepo: userRepo,
	}
}

type CreatePostInput struct {
	Content  string
	AuthorID uint
	ParentID *uint
	RepostID *uint
}

type CreatePostOutput struct {
	Post *models.Post
}

func (uc *CreatePostUseCase) Execute(ctx context.Context, input CreatePostInput) (*CreatePostOutput, error) {
	// Validation
	if input.RepostID == nil && input.Content == "" {
		return nil, domainErrors.ErrInvalidInput
	}
	if utf8.RuneCountInString(input.Content) > 140 {
		return nil, domainErrors.ErrInvalidInput
	}

	post := &models.Post{
		Content:  input.Content,
		AuthorID: input.AuthorID,
		ParentID: input.ParentID,
		RepostID: input.RepostID,
	}

	if err := uc.postRepo.Create(ctx, post); err != nil {
		return nil, err
	}

	// Fetch Author details
	author, err := uc.userRepo.FindByID(ctx, input.AuthorID)
	if err == nil {
		post.Author = *author
	}

	// Fetch Repost details if this is a repost
	if input.RepostID != nil {
		repostData, err := uc.postRepo.FindByID(ctx, *input.RepostID)
		if err == nil {
			// Fetch repost author
			repostAuthor, err := uc.userRepo.FindByID(ctx, repostData.AuthorID)
			if err == nil {
				repostData.Author = *repostAuthor
			}
			post.Repost = repostData
		}
	}

	return &CreatePostOutput{Post: post}, nil
}

package post

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type GetPostDetailUseCase struct {
	postRepo     repositories.PostRepository
	userRepo     repositories.UserRepository
	likeRepo     repositories.LikeRepository
	bookmarkRepo repositories.BookmarkRepository
}

func NewGetPostDetailUseCase(postRepo repositories.PostRepository, userRepo repositories.UserRepository, likeRepo repositories.LikeRepository, bookmarkRepo repositories.BookmarkRepository) *GetPostDetailUseCase {
	return &GetPostDetailUseCase{
		postRepo:     postRepo,
		userRepo:     userRepo,
		likeRepo:     likeRepo,
		bookmarkRepo: bookmarkRepo,
	}
}

func (uc *GetPostDetailUseCase) Execute(ctx context.Context, postID uint, userID uint) (*models.Post, error) {
	post, err := uc.postRepo.FindByID(ctx, postID)
	if err != nil {
		return nil, err
	}

	// Fetch author
	author, err := uc.userRepo.FindByID(ctx, post.AuthorID)
	if err == nil {
		post.Author = *author
	}

	// Populate like status and count
	isLiked, err := uc.likeRepo.Exists(ctx, userID, post.ID)
	if err == nil {
		post.IsLiked = isLiked
	}

	likeCount, err := uc.likeRepo.CountByPostID(ctx, post.ID)
	if err == nil {
		post.LikeCount = likeCount
	}

	// Populate bookmark status and count
	isBookmarked, err := uc.bookmarkRepo.Exists(ctx, userID, post.ID)
	if err == nil {
		post.IsBookmarked = isBookmarked
	}

	bookmarkCount, err := uc.bookmarkRepo.CountByPostID(ctx, post.ID)
	if err == nil {
		post.BookmarkCount = bookmarkCount
	}

	// Populate reply count
	replyCount, err := uc.postRepo.CountReplies(ctx, post.ID)
	if err == nil {
		post.ReplyCount = replyCount
	}

	// Populate repost count
	repostCount, err := uc.postRepo.CountReposts(ctx, post.ID)
	if err == nil {
		post.RepostCount = repostCount
	}

	// Check if reposted
	isReposted, err := uc.postRepo.CheckReposted(ctx, userID, post.ID)
	if err == nil {
		post.IsReposted = isReposted
	}

	return post, nil
}

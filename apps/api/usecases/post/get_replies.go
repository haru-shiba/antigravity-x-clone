package post

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type GetRepliesUseCase struct {
	postRepo     repositories.PostRepository
	userRepo     repositories.UserRepository
	likeRepo     repositories.LikeRepository
	bookmarkRepo repositories.BookmarkRepository
}

func NewGetRepliesUseCase(postRepo repositories.PostRepository, userRepo repositories.UserRepository, likeRepo repositories.LikeRepository, bookmarkRepo repositories.BookmarkRepository) *GetRepliesUseCase {
	return &GetRepliesUseCase{
		postRepo:     postRepo,
		userRepo:     userRepo,
		likeRepo:     likeRepo,
		bookmarkRepo: bookmarkRepo,
	}
}

func (uc *GetRepliesUseCase) Execute(ctx context.Context, postID uint, userID uint) ([]*models.Post, error) {
	replies, err := uc.postRepo.GetReplies(ctx, postID)
	if err != nil {
		return nil, err
	}

	// Populate author and counts for each reply
	for _, reply := range replies {
		// Fetch author
		author, err := uc.userRepo.FindByID(ctx, reply.AuthorID)
		if err == nil {
			reply.Author = *author
		}

		// Populate like status and count
		isLiked, err := uc.likeRepo.Exists(ctx, userID, reply.ID)
		if err == nil {
			reply.IsLiked = isLiked
		}

		likeCount, err := uc.likeRepo.CountByPostID(ctx, reply.ID)
		if err == nil {
			reply.LikeCount = likeCount
		}

		// Populate bookmark status and count
		isBookmarked, err := uc.bookmarkRepo.Exists(ctx, userID, reply.ID)
		if err == nil {
			reply.IsBookmarked = isBookmarked
		}

		bookmarkCount, err := uc.bookmarkRepo.CountByPostID(ctx, reply.ID)
		if err == nil {
			reply.BookmarkCount = bookmarkCount
		}

		// Populate reply count
		replyCount, err := uc.postRepo.CountReplies(ctx, reply.ID)
		if err == nil {
			reply.ReplyCount = replyCount
		}

		// Populate repost count
		repostCount, err := uc.postRepo.CountReposts(ctx, reply.ID)
		if err == nil {
			reply.RepostCount = repostCount
		}

		// Check if reposted
		isReposted, err := uc.postRepo.CheckReposted(ctx, userID, reply.ID)
		if err == nil {
			reply.IsReposted = isReposted
		}
	}

	return replies, nil
}

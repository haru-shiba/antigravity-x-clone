package post

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type GetBookmarksUseCase struct {
	postRepo     repositories.PostRepository
	likeRepo     repositories.LikeRepository
	bookmarkRepo repositories.BookmarkRepository
}

func NewGetBookmarksUseCase(postRepo repositories.PostRepository, likeRepo repositories.LikeRepository, bookmarkRepo repositories.BookmarkRepository) *GetBookmarksUseCase {
	return &GetBookmarksUseCase{
		postRepo:     postRepo,
		likeRepo:     likeRepo,
		bookmarkRepo: bookmarkRepo,
	}
}

func (uc *GetBookmarksUseCase) Execute(ctx context.Context, userID uint, limit, offset int) ([]*models.Post, error) {
	posts, err := uc.postRepo.GetBookmarkedPosts(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	// Populate IsLiked, IsBookmarked status and all counts
	for _, post := range posts {
		// Check if liked
		isLiked, err := uc.likeRepo.Exists(ctx, userID, post.ID)
		if err == nil {
			post.IsLiked = isLiked
		}

		// Get like count
		likeCount, err := uc.likeRepo.CountByPostID(ctx, post.ID)
		if err == nil {
			post.LikeCount = likeCount
		}

		// Check if bookmarked
		isBookmarked, err := uc.bookmarkRepo.Exists(ctx, userID, post.ID)
		if err == nil {
			post.IsBookmarked = isBookmarked
		}

		// Get bookmark count
		bookmarkCount, err := uc.bookmarkRepo.CountByPostID(ctx, post.ID)
		if err == nil {
			post.BookmarkCount = bookmarkCount
		}

		// Get reply count
		replyCount, err := uc.postRepo.CountReplies(ctx, post.ID)
		if err == nil {
			post.ReplyCount = replyCount
		}

		// Get repost count
		repostCount, err := uc.postRepo.CountReposts(ctx, post.ID)
		if err == nil {
			post.RepostCount = repostCount
		}

		// Check if reposted
		isReposted, err := uc.postRepo.CheckReposted(ctx, userID, post.ID)
		if err == nil {
			post.IsReposted = isReposted
		}

		// Handle Repost status and counts
		if post.Repost != nil {
			isRepostLiked, err := uc.likeRepo.Exists(ctx, userID, post.Repost.ID)
			if err == nil {
				post.Repost.IsLiked = isRepostLiked
			}

			repostLikeCount, err := uc.likeRepo.CountByPostID(ctx, post.Repost.ID)
			if err == nil {
				post.Repost.LikeCount = repostLikeCount
			}

			isRepostBookmarked, err := uc.bookmarkRepo.Exists(ctx, userID, post.Repost.ID)
			if err == nil {
				post.Repost.IsBookmarked = isRepostBookmarked
			}

			repostBookmarkCount, err := uc.bookmarkRepo.CountByPostID(ctx, post.Repost.ID)
			if err == nil {
				post.Repost.BookmarkCount = repostBookmarkCount
			}

			repostReplyCount, err := uc.postRepo.CountReplies(ctx, post.Repost.ID)
			if err == nil {
				post.Repost.ReplyCount = repostReplyCount
			}

			repostRepostCount, err := uc.postRepo.CountReposts(ctx, post.Repost.ID)
			if err == nil {
				post.Repost.RepostCount = repostRepostCount
			}

			isRepostReposted, err := uc.postRepo.CheckReposted(ctx, userID, post.Repost.ID)
			if err == nil {
				post.Repost.IsReposted = isRepostReposted
			}
		}
	}

	return posts, nil
}

package post

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type GetTimelineUseCase struct {
	postRepo repositories.PostRepository
	likeRepo repositories.LikeRepository
	bookmarkRepo repositories.BookmarkRepository
}

func NewGetTimelineUseCase(postRepo repositories.PostRepository, likeRepo repositories.LikeRepository, bookmarkRepo repositories.BookmarkRepository) *GetTimelineUseCase {
	return &GetTimelineUseCase{
		postRepo: postRepo,
		likeRepo: likeRepo,
		bookmarkRepo: bookmarkRepo,
	}
}

type GetTimelineInput struct {
	Limit        int
	Offset       int
	UserID       uint
	TargetUserID *uint
}

type GetTimelineOutput struct {
	Posts     []*models.Post
	LikeMap   map[uint]bool
	LikeCounts map[uint]int64
	BookmarkMap map[uint]bool
	BookmarkCounts map[uint]int64
}

func (uc *GetTimelineUseCase) Execute(ctx context.Context, input GetTimelineInput) (*GetTimelineOutput, error) {
	posts, err := uc.postRepo.List(ctx, input.Limit, input.Offset, input.TargetUserID)
	if err != nil {
		return nil, err
	}

	likeMap := make(map[uint]bool)
	likeCounts := make(map[uint]int64)
	bookmarkMap := make(map[uint]bool)
	bookmarkCounts := make(map[uint]int64)

	for _, post := range posts {
		// Check if liked by user
		exists, err := uc.likeRepo.Exists(ctx, input.UserID, post.ID)
		if err != nil {
			return nil, err
		}
		likeMap[post.ID] = exists

		// Get like count
		count, err := uc.likeRepo.CountByPostID(ctx, post.ID)
		if err != nil {
			return nil, err
		}
		likeCounts[post.ID] = count
		post.LikeCount = count

		// Check if bookmarked by user
		exists, err = uc.bookmarkRepo.Exists(ctx, input.UserID, post.ID)
		if err != nil {
			return nil, err
		}
		bookmarkMap[post.ID] = exists
		post.IsBookmarked = exists

		// Get bookmark count
		count, err = uc.bookmarkRepo.CountByPostID(ctx, post.ID)
		if err != nil {
			return nil, err
		}
		bookmarkCounts[post.ID] = count
		post.BookmarkCount = count

		// Get reply count
		replyCount, err := uc.postRepo.CountReplies(ctx, post.ID)
		if err != nil {
			return nil, err
		}
		post.ReplyCount = replyCount

		// Get repost count
		repostCount, err := uc.postRepo.CountReposts(ctx, post.ID)
		if err != nil {
			return nil, err
		}
		post.RepostCount = repostCount

		// Check if user has reposted this post
		isReposted, err := uc.postRepo.CheckReposted(ctx, input.UserID, post.ID)
		if err != nil {
			return nil, err
		}
		post.IsReposted = isReposted
		
		// Handle Repost
		if post.Repost != nil {
			exists, err := uc.likeRepo.Exists(ctx, input.UserID, post.Repost.ID)
			if err != nil {
				return nil, err
			}
			likeMap[post.Repost.ID] = exists
			post.Repost.IsLiked = exists

			count, err := uc.likeRepo.CountByPostID(ctx, post.Repost.ID)
			if err != nil {
				return nil, err
			}
			likeCounts[post.Repost.ID] = count
			post.Repost.LikeCount = count

			exists, err = uc.bookmarkRepo.Exists(ctx, input.UserID, post.Repost.ID)
			if err != nil {
				return nil, err
			}
			bookmarkMap[post.Repost.ID] = exists
			post.Repost.IsBookmarked = exists

			count, err = uc.bookmarkRepo.CountByPostID(ctx, post.Repost.ID)
			if err != nil {
				return nil, err
			}
			bookmarkCounts[post.Repost.ID] = count
			post.Repost.BookmarkCount = count

			replyCount, err := uc.postRepo.CountReplies(ctx, post.Repost.ID)
			if err != nil {
				return nil, err
			}
			post.Repost.ReplyCount = replyCount

			repostCount, err := uc.postRepo.CountReposts(ctx, post.Repost.ID)
			if err != nil {
				return nil, err
			}
			post.Repost.RepostCount = repostCount

			isReposted, err := uc.postRepo.CheckReposted(ctx, input.UserID, post.Repost.ID)
			if err != nil {
				return nil, err
			}
			post.Repost.IsReposted = isReposted
		}
	}

	return &GetTimelineOutput{
		Posts:      posts,
		LikeMap:    likeMap,
		LikeCounts: likeCounts,
		BookmarkMap: bookmarkMap,
		BookmarkCounts: bookmarkCounts,
	}, nil
}

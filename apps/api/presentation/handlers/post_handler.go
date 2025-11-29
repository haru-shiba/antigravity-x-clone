package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	domainErrors "github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/errors"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/requests"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/presentation/responses"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/usecases/post"
)

type PostHandler struct {
	createPostUC      *post.CreatePostUseCase
	getTimelineUC     *post.GetTimelineUseCase
	getBookmarksUC    *post.GetBookmarksUseCase
	deletePostUC      *post.DeletePostUseCase
	getPostDetailUC   *post.GetPostDetailUseCase
	getRepliesUC      *post.GetRepliesUseCase
}

func NewPostHandler(createPostUC *post.CreatePostUseCase, getTimelineUC *post.GetTimelineUseCase, getBookmarksUC *post.GetBookmarksUseCase, deletePostUC *post.DeletePostUseCase, getPostDetailUC *post.GetPostDetailUseCase, getRepliesUC *post.GetRepliesUseCase) *PostHandler {
	return &PostHandler{
		createPostUC:    createPostUC,
		getTimelineUC:   getTimelineUC,
		getBookmarksUC:  getBookmarksUC,
		deletePostUC:    deletePostUC,
		getPostDetailUC: getPostDetailUC,
		getRepliesUC:    getRepliesUC,
	}
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	var req requests.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Printf("CreatePost Request: %+v\n", req)

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	input := post.CreatePostInput{
		Content:  req.Content,
		AuthorID: userID.(uint),
		ParentID: req.ParentID,
		RepostID: req.RepostID,
	}

	output, err := h.createPostUC.Execute(c.Request.Context(), input)
	if err != nil {
		switch err {
		case domainErrors.ErrInvalidInput:
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, responses.ToPostResponse(output.Post, 0, false, 0, false))
}

func (h *PostHandler) GetTimeline(c *gin.Context) {
	limit := 20
	offset := 0
	if l := c.Query("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil {
			limit = val
		}
	}
	if o := c.Query("offset"); o != "" {
		if val, err := strconv.Atoi(o); err == nil {
			offset = val
		}
	}

	var targetUserID *uint
	if u := c.Query("user_id"); u != "" {
		if val, err := strconv.ParseUint(u, 10, 64); err == nil {
			uid := uint(val)
			targetUserID = &uid
		}
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	input := post.GetTimelineInput{
		Limit:        limit,
		Offset:       offset,
		UserID:       userID.(uint),
		TargetUserID: targetUserID,
	}

	output, err := h.getTimelineUC.Execute(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []responses.PostResponse
	for _, p := range output.Posts {
		// Main post info
		likeCount := output.LikeCounts[p.ID]
		isLiked := output.LikeMap[p.ID]
		bookmarkCount := output.BookmarkCounts[p.ID]
		isBookmarked := output.BookmarkMap[p.ID]
		
		res := responses.ToPostResponse(p, likeCount, isLiked, bookmarkCount, isBookmarked)

		// Update Repost info if exists
		if p.Repost != nil {
			repostLikeCount := output.LikeCounts[p.Repost.ID]
			repostIsLiked := output.LikeMap[p.Repost.ID]
			repostBookmarkCount := output.BookmarkCounts[p.Repost.ID]
			repostIsBookmarked := output.BookmarkMap[p.Repost.ID]
			repostRes := responses.ToPostResponse(p.Repost, repostLikeCount, repostIsLiked, repostBookmarkCount, repostIsBookmarked)
			res.Repost = &repostRes
		}

		response = append(response, res)
	}

	c.JSON(http.StatusOK, response)
}

func (h *PostHandler) GetBookmarks(c *gin.Context) {
	limit := 20
	offset := 0
	if l := c.Query("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil {
			limit = val
		}
	}
	if o := c.Query("offset"); o != "" {
		if val, err := strconv.Atoi(o); err == nil {
			offset = val
		}
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	output, err := h.getBookmarksUC.Execute(c.Request.Context(), userID.(uint), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []responses.PostResponse
	for _, p := range output {
		res := responses.ToPostResponse(p, 0, p.IsLiked, 0, p.IsBookmarked) // Counts are missing!
		if p.Repost != nil {
			repostRes := responses.ToPostResponse(p.Repost, 0, p.Repost.IsLiked, 0, p.Repost.IsBookmarked)
			res.Repost = &repostRes
		}
		response = append(response, res)
	}

	c.JSON(http.StatusOK, response)
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.deletePostUC.Execute(c.Request.Context(), uint(id), userID.(uint)); err != nil {
		switch err {
		case domainErrors.ErrUnauthorized:
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *PostHandler) GetPostDetail(c *gin.Context) {
	postID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	post, err := h.getPostDetailUC.Execute(c.Request.Context(), uint(postID), userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, responses.ToPostResponse(post, post.LikeCount, post.IsLiked, post.BookmarkCount, post.IsBookmarked))
}

func (h *PostHandler) GetReplies(c *gin.Context) {
	postID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	replies, err := h.getRepliesUC.Execute(c.Request.Context(), uint(postID), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var responseList []responses.PostResponse
	for _, reply := range replies {
		responseList = append(responseList, responses.ToPostResponse(reply, reply.LikeCount, reply.IsLiked, reply.BookmarkCount, reply.IsBookmarked))
	}

	c.JSON(http.StatusOK, responseList)
}

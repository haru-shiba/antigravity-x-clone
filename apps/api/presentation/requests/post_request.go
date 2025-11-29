package requests

type CreatePostRequest struct {
	Content  string `json:"content" binding:"max=140"`
	ParentID *uint  `json:"parent_id"`
	RepostID *uint  `json:"repost_id"`
}

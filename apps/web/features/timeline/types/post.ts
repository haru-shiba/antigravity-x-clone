import { UserResponse } from '../../users/types/user';

export type Post = {
    id: number;
    content: string;
    author: UserResponse;
    parent_id?: number;
    repost_id?: number;
    repost?: Post;
    like_count: number;
    is_liked: boolean;
    bookmark_count: number;
    is_bookmarked: boolean;
    reply_count: number;
    repost_count: number;
    is_reposted: boolean;
    created_at: string;
};

export type CreatePostRequest = {
    content: string;
    parent_id?: number;
    repost_id?: number;
};

export type PostResponse = Post;

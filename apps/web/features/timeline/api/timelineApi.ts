import { CreatePostRequest, PostResponse } from '../types/post';

const API_URL = 'http://localhost:8080/api';

export const createPost = async (data: CreatePostRequest): Promise<PostResponse> => {
    const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
    }

    return response.json();
};

export const getTimeline = async (limit = 20, offset = 0, userId?: number): Promise<PostResponse[]> => {
    let url = `${API_URL}/posts?limit=${limit}&offset=${offset}`;
    if (userId) {
        url += `&user_id=${userId}`;
    }
    const response = await fetch(url, {
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch timeline');
    }

    return response.json();
};

export const getBookmarks = async (limit = 20, offset = 0): Promise<PostResponse[]> => {
    const response = await fetch(`${API_URL}/bookmarks?limit=${limit}&offset=${offset}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bookmarks');
    }

    return response.json();
};

export const toggleLike = async (postId: number): Promise<{ is_liked: boolean; like_count: number }> => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle like');
    }

    return response.json();
};

export const toggleBookmark = async (postId: number): Promise<{ is_bookmarked: boolean; bookmark_count: number }> => {
    const response = await fetch(`${API_URL}/posts/${postId}/bookmark`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle bookmark');
    }

    return response.json();
};

export const deletePost = async (postId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete post' }));
        throw new Error(errorData.error || 'Failed to delete post');
    }
    // 204 No Content - no need to parse JSON
};

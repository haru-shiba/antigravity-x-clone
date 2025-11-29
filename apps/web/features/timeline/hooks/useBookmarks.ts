import { useState, useEffect, useCallback } from 'react';
import { getBookmarks, toggleLike as apiToggleLike, toggleBookmark as apiToggleBookmark, createPost } from '../api/timelineApi';
import { Post } from '../types/post';

export const useBookmarks = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookmarks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getBookmarks(20, 0);
            setPosts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const toggleLike = async (postId: number) => {
        try {
            const { is_liked, like_count } = await apiToggleLike(postId);
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        return { ...post, is_liked, like_count };
                    }
                    if (post.repost && post.repost.id === postId) {
                        return { ...post, repost: { ...post.repost, is_liked, like_count } };
                    }
                    return post;
                })
            );
        } catch (err: any) {
            console.error('Failed to toggle like:', err);
        }
    };

    const toggleBookmark = async (postId: number) => {
        try {
            const { is_bookmarked, bookmark_count } = await apiToggleBookmark(postId);
            // If we unbookmark in the bookmarks page, should we remove it from the list?
            // For now, let's just update the state, maybe user wants to re-bookmark immediately.
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        return { ...post, is_bookmarked, bookmark_count };
                    }
                    if (post.repost && post.repost.id === postId) {
                        return { ...post, repost: { ...post.repost, is_bookmarked, bookmark_count } };
                    }
                    return post;
                })
            );
        } catch (err: any) {
            console.error('Failed to toggle bookmark:', err);
        }
    };

    const repostMessage = async (repostId: number) => {
        try {
            await createPost({ content: '', repost_id: repostId });
            // Update the repost count and is_reposted status
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === repostId) {
                        return { ...post, repost_count: (post.repost_count || 0) + 1, is_reposted: true };
                    }
                    if (post.repost && post.repost.id === repostId) {
                        return { ...post, repost: { ...post.repost, repost_count: (post.repost.repost_count || 0) + 1, is_reposted: true } };
                    }
                    return post;
                })
            );
        } catch (err: any) {
            console.error('Failed to repost:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    return { posts, isLoading, error, toggleLike, toggleBookmark, repostMessage, refresh: fetchBookmarks };
};

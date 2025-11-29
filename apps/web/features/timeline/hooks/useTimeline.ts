import { useState, useEffect, useCallback } from 'react';
import { getTimeline, createPost, toggleLike as apiToggleLike, toggleBookmark as apiToggleBookmark, deletePost as apiDeletePost } from '../api/timelineApi';
import { Post } from '../types/post';

export const useTimeline = (userId?: number) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeline = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTimeline(20, 0, userId);
            setPosts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const postMessage = async (content: string, parentId?: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const newPost = await createPost({ content, parent_id: parentId });
            setPosts((prevPosts) => {
                const updatedPosts = [newPost, ...(prevPosts || [])];
                if (parentId) {
                    return updatedPosts.map(post => {
                        if (post.id === parentId) {
                            return { ...post, reply_count: (post.reply_count || 0) + 1 };
                        }
                        if (post.repost && post.repost.id === parentId) {
                            return { ...post, repost: { ...post.repost, reply_count: (post.repost.reply_count || 0) + 1 } };
                        }
                        return post;
                    });
                }
                return updatedPosts;
            });
            return newPost;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const repostMessage = async (repostId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const newPost = await createPost({ content: '', repost_id: repostId });
            setPosts((prevPosts) => {
                const updatedPosts = [newPost, ...(prevPosts || [])];
                // Update the original post's repost count and is_reposted status
                return updatedPosts.map(post => {
                    if (post.id === repostId) {
                        return { ...post, repost_count: (post.repost_count || 0) + 1, is_reposted: true };
                    }
                    if (post.repost && post.repost.id === repostId) {
                        return { ...post, repost: { ...post.repost, repost_count: (post.repost.repost_count || 0) + 1, is_reposted: true } };
                    }
                    return post;
                });
            });
            return newPost;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

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
            // Optionally set error state
        }
    };

    const toggleBookmark = async (postId: number) => {
        try {
            const { is_bookmarked, bookmark_count } = await apiToggleBookmark(postId);
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
            // Optionally set error state
        }
    };

    const deletePost = async (postId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiDeletePost(postId);
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId && (!post.repost || post.repost.id !== postId)));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    return { posts, postMessage, repostMessage, toggleLike, toggleBookmark, deletePost, isLoading, error, refresh: fetchTimeline };
};

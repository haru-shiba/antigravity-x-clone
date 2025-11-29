'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/features/timeline/types/post';
import { toggleLike as apiToggleLike, toggleBookmark as apiToggleBookmark, createPost } from '@/features/timeline/api/timelineApi';

const API_URL = 'http://localhost:8080/api';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [replies, setReplies] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const fetchPostAndReplies = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch post details
            const postResponse = await fetch(`${API_URL}/posts/${postId}`, {
                credentials: 'include',
            });
            if (!postResponse.ok) {
                throw new Error('Failed to fetch post');
            }
            const postData = await postResponse.json();
            setPost(postData);

            // Fetch replies
            const repliesResponse = await fetch(`${API_URL}/posts/${postId}/replies`, {
                credentials: 'include',
            });
            if (!repliesResponse.ok) {
                throw new Error('Failed to fetch replies');
            }
            const repliesData = await repliesResponse.json();
            setReplies(repliesData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchPostAndReplies();
        }
    }, [postId]);

    const handleToggleLike = async () => {
        if (!post) return;
        try {
            const { is_liked, like_count } = await apiToggleLike(post.id);
            setPost({ ...post, is_liked, like_count });
        } catch (err) {
            console.error('Failed to toggle like:', err);
        }
    };

    const handleToggleBookmark = async () => {
        if (!post) return;
        try {
            const { is_bookmarked, bookmark_count } = await apiToggleBookmark(post.id);
            setPost({ ...post, is_bookmarked, bookmark_count });
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
        }
    };

    const handleRepost = async () => {
        if (!post) return;
        try {
            await createPost({ content: '', repost_id: post.id });
            setPost({ ...post, repost_count: (post.repost_count || 0) + 1, is_reposted: true });
        } catch (err) {
            console.error('Failed to repost:', err);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !post) return;

        setIsReplying(true);
        try {
            await createPost({ content: replyContent, parent_id: post.id });
            setReplyContent('');
            // Refresh replies
            await fetchPostAndReplies();
        } catch (err) {
            console.error('Failed to reply:', err);
        } finally {
            setIsReplying(false);
        }
    };

    if (isLoading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    if (!post) return <div className="text-center p-8">Post not found</div>;

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-3 border-b border-[var(--border-color)]">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.back()} className="hover:bg-gray-800 rounded-full p-2">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>
                    </button>
                    <h1 className="font-bold text-xl">Post</h1>
                </div>
            </div>

            {/* Main Post */}
            <div className="border-b border-[var(--border-color)] p-4">
                <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                            <Link href={`/users/${post.author.username}`} className="font-bold hover:underline text-white">
                                {post.author.username}
                            </Link>
                            <span className="text-gray-500">@{post.author.username}</span>
                        </div>
                        <div className="text-white text-xl mt-3 mb-4 whitespace-pre-wrap">
                            {post.content}
                        </div>
                        <div className="text-gray-500 text-sm mb-4">
                            {new Date(post.created_at).toLocaleString()}
                        </div>

                        {/* Stats */}
                        <div className="flex space-x-6 text-sm border-t border-b border-[var(--border-color)] py-3 mb-3">
                            <div><span className="font-bold text-white">{post.reply_count || 0}</span> <span className="text-gray-500">Replies</span></div>
                            <div><span className="font-bold text-white">{post.repost_count || 0}</span> <span className="text-gray-500">Reposts</span></div>
                            <div><span className="font-bold text-white">{post.like_count || 0}</span> <span className="text-gray-500">Likes</span></div>
                            <div><span className="font-bold text-white">{post.bookmark_count || 0}</span> <span className="text-gray-500">Bookmarks</span></div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-around border-b border-[var(--border-color)] pb-3">
                            <button className="group flex items-center space-x-2 hover:text-[var(--accent-color)] transition-colors">
                                <div className="p-2 rounded-full group-hover:bg-[rgba(29,155,240,0.1)] transition-colors">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                </div>
                            </button>

                            <button
                                onClick={handleRepost}
                                className={`group flex items-center space-x-2 hover:text-green-500 transition-colors ${post.is_reposted ? 'text-green-500' : ''}`}
                            >
                                <div className="p-2 rounded-full group-hover:bg-[rgba(0,186,124,0.1)] transition-colors">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                </div>
                            </button>

                            <button
                                onClick={handleToggleLike}
                                className={`group flex items-center space-x-2 hover:text-pink-600 transition-colors ${post.is_liked ? 'text-pink-600' : ''}`}
                            >
                                <div className="p-2 rounded-full group-hover:bg-[rgba(249,24,128,0.1)] transition-colors">
                                    {post.is_liked ? (
                                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.5 4.798 2.01 1.429-1.51 3.147-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.5 4.798 2.01 1.429-1.51 3.147-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={handleToggleBookmark}
                                className={`group flex items-center space-x-2 hover:text-blue-500 transition-colors ${post.is_bookmarked ? 'text-blue-500' : ''}`}
                            >
                                <div className="p-2 rounded-full group-hover:bg-[rgba(29,155,240,0.1)] transition-colors">
                                    {post.is_bookmarked ? (
                                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reply Form */}
            <div className="border-b border-[var(--border-color)] p-4">
                <form onSubmit={handleReply} className="flex space-x-3">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="flex-grow">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Post your reply"
                            className="w-full bg-transparent text-white text-xl placeholder-gray-500 outline-none resize-none"
                            rows={3}
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={!replyContent.trim() || isReplying}
                                className="bg-[var(--accent-color)] text-white font-bold py-2 px-6 rounded-full hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isReplying ? 'Replying...' : 'Reply'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Replies */}
            <div>
                {replies && replies.map((reply) => (
                    <div key={reply.id} className="border-b border-[var(--border-color)] p-4 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
                        onClick={() => router.push(`/posts/${reply.id}`)}>
                        <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center space-x-2">
                                    <Link href={`/users/${reply.author.username}`} className="font-bold hover:underline text-white" onClick={(e) => e.stopPropagation()}>
                                        {reply.author.username}
                                    </Link>
                                    <span className="text-gray-500">@{reply.author.username}</span>
                                    <span className="text-gray-500">·</span>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(reply.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-white whitespace-pre-wrap mt-1">
                                    {reply.content}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {(!replies || replies.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                        No replies yet
                    </div>
                )}
            </div>
        </div>
    );
}

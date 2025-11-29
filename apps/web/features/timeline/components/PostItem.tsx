'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '../types/post';
import { useAuth } from '@/hooks/useAuth';

interface PostItemProps {
    post: Post;
    onToggleLike: (postId: number) => void;
    onToggleBookmark: (postId: number) => void;
    onRepost: (postId: number) => void;
    onDelete?: (postId: number) => void;
}

export const PostItem = ({ post, onToggleLike, onToggleBookmark, onRepost, onDelete }: PostItemProps) => {
    const router = useRouter();
    const { user } = useAuth();
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const displayPost = post.repost || post;
    const isRepost = !!post.repost;

    const handlePostClick = () => {
        router.push(`/posts/${displayPost.id}`);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && confirm('Are you sure you want to delete this post?')) {
            await onDelete(post.id);
        }
        setOpenMenuId(null);
    };

    return (
        <div
            onClick={handlePostClick}
            className="border-b border-[var(--border-color)] p-4 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
        >
            {isRepost && (
                <div className="text-gray-500 text-sm mb-1 flex items-center ml-12">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 mr-2 fill-current">
                        <g><path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></g>
                    </svg>
                    <Link href={`/users/${post.author.username}`} onClick={(e) => e.stopPropagation()} className="font-bold hover:underline">
                        {post.author.username}
                    </Link>
                    <span className="ml-2">reposted</span>
                </div>
            )}

            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <Link
                                href={`/users/${displayPost.author.username}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold hover:underline text-white"
                            >
                                {displayPost.author.username}
                            </Link>
                            <span className="text-gray-500">@{displayPost.author.username}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500 text-sm hover:underline">
                                {new Date(displayPost.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        {user && user.id === post.author.id && onDelete && (
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }}
                                    className="text-gray-500 hover:text-[var(--accent-color)] rounded-full p-2 hover:bg-[var(--hover-bg)] transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                        <g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g>
                                    </svg>
                                </button>
                                {openMenuId === post.id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-black border border-[var(--border-color)] rounded-lg shadow-lg z-10">
                                        <button
                                            onClick={handleDelete}
                                            className="w-full text-left px-4 py-3 hover:bg-[var(--hover-bg)] text-red-500 font-bold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="text-white whitespace-pre-wrap mb-3 mt-1">
                        {displayPost.content}
                    </div>

                    <div className="flex justify-between max-w-md text-gray-500">
                        {/* Reply Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="group flex items-center space-x-2 hover:text-[var(--accent-color)] transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-[rgba(29,155,240,0.1)] transition-colors">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                    <g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g>
                                </svg>
                            </div>
                            <span className="text-sm">{displayPost.reply_count || 0}</span>
                        </button>

                        {/* Repost Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onRepost(displayPost.id); }}
                            className={`group flex items-center space-x-2 hover:text-green-500 transition-colors ${displayPost.is_reposted ? 'text-green-500' : ''}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-[rgba(0,186,124,0.1)] transition-colors">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                    <g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g>
                                </svg>
                            </div>
                            <span className="text-sm">{displayPost.repost_count || 0}</span>
                        </button>

                        {/* Like Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleLike(displayPost.id); }}
                            className={`group flex items-center space-x-2 hover:text-pink-600 transition-colors ${displayPost.is_liked ? 'text-pink-600' : ''}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-[rgba(249,24,128,0.1)] transition-colors">
                                {displayPost.is_liked ? (
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                        <g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.5 4.798 2.01 1.429-1.51 3.147-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                        <g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.5 4.798 2.01 1.429-1.51 3.147-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm">{displayPost.like_count || 0}</span>
                        </button>

                        {/* Bookmark Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleBookmark(displayPost.id); }}
                            className={`group flex items-center space-x-2 hover:text-blue-500 transition-colors ${displayPost.is_bookmarked ? 'text-blue-500' : ''}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-[rgba(29,155,240,0.1)] transition-colors">
                                {displayPost.is_bookmarked ? (
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                        <g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                        <g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g>
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm">{displayPost.bookmark_count || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

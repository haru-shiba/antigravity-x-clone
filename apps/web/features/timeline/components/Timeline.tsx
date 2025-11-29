'use client';

import { useState } from 'react';
import { useTimeline } from '../hooks/useTimeline';
import { CreatePostForm } from './CreatePostForm';
import { ReplyForm } from './ReplyForm';
import { PostItem } from './PostItem';

interface TimelineProps {
    userId?: number;
    showPostForm?: boolean;
}

export const Timeline = ({ userId, showPostForm = true }: TimelineProps) => {
    const { posts, postMessage, repostMessage, toggleLike, toggleBookmark, deletePost, isLoading, error } = useTimeline(userId);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const handlePostSubmit = async (content: string) => {
        await postMessage(content);
    };

    const handleReplySubmit = async (content: string) => {
        if (replyingTo) {
            await postMessage(content, replyingTo);
            setReplyingTo(null);
        }
    };

    if (isLoading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="border-t border-[var(--border-color)]">
            {showPostForm && (
                <CreatePostForm onSubmit={handlePostSubmit} isLoading={isLoading} />
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 m-4 rounded">
                    {error}
                </div>
            )}

            <div>
                {posts && posts.map((post) => (
                    <PostItem
                        key={post.id}
                        post={post}
                        onToggleLike={toggleLike}
                        onToggleBookmark={toggleBookmark}
                        onRepost={repostMessage}
                        onDelete={deletePost}
                    />
                ))}
            </div>

            {replyingTo && (
                <ReplyForm
                    onSubmit={handleReplySubmit}
                    onCancel={() => setReplyingTo(null)}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

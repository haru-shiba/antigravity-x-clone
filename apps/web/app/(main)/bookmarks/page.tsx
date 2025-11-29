'use client';

import { useBookmarks } from '@/features/timeline/hooks/useBookmarks';
import { PostItem } from '@/features/timeline/components/PostItem';

export default function BookmarksPage() {
    const { posts, isLoading, error, toggleLike, toggleBookmark, repostMessage } = useBookmarks();

    if (isLoading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-3 border-b border-[var(--border-color)]">
                <h1 className="font-bold text-xl">Bookmarks</h1>
                <div className="text-sm text-gray-500">@{posts?.[0]?.author?.username}</div>
            </div>

            <div>
                {posts && posts.map((post) => (
                    <PostItem
                        key={post.id}
                        post={post}
                        onToggleLike={toggleLike}
                        onToggleBookmark={toggleBookmark}
                        onRepost={repostMessage}
                    />
                ))}
                {posts && posts.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 py-8">
                        You haven't added any Bookmarks yet
                    </div>
                )}
            </div>
        </div>
    );
}

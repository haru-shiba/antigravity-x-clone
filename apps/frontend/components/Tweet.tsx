'use client';

import Link from 'next/link';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BsChat, BsArrowRepeat, BsHeart, BsBookmark, BsBookmarkFill, BsTrash } from 'react-icons/bs';

interface TweetProps {
    tweet: any;
    currentUser?: any;
    onDelete?: (id: number) => void;
    isBookmarked?: boolean;
}

export default function Tweet({ tweet, currentUser, onDelete, isBookmarked = false }: TweetProps) {
    const router = useRouter();
    const [bookmarked, setBookmarked] = useState(isBookmarked);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm('Delete this tweet?')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/tweets/${tweet.id}`, token || '');
            if (onDelete) onDelete(tweet.id);
        } catch (err) {
            alert('Failed to delete tweet');
        }
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (bookmarked) {
                await api.delete(`/bookmarks/${tweet.id}`, token || '');
                setBookmarked(false);
            } else {
                await api.post(`/bookmarks/${tweet.id}`, {}, token || '');
                setBookmarked(true);
            }
        } catch (err) {
            alert('Failed to update bookmark');
        }
    };

    return (
        <Link href={`/tweet/${tweet.id}`} className="block p-4 border-b border-gray-800 hover:bg-gray-900/50 transition">
            <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold">{tweet.user?.username || 'Unknown'}</span>
                            <span className="text-gray-500 text-sm">@{tweet.user?.username}</span>
                            <span className="text-gray-500 text-sm">· {new Date(tweet.created_at).toLocaleDateString()}</span>
                        </div>
                        {currentUser && currentUser.id === tweet.user_id && (
                            <button onClick={handleDelete} className="text-red-500 hover:bg-red-900/20 p-2 rounded-full transition">
                                <BsTrash />
                            </button>
                        )}
                    </div>
                    <p className="mt-1 text-white whitespace-pre-wrap">{tweet.content}</p>
                    <div className="mt-3 flex justify-between text-gray-500 max-w-md">
                        <button className="flex items-center space-x-2 hover:text-blue-500 transition group">
                            <div className="p-2 rounded-full group-hover:bg-blue-900/20"><BsChat /></div>
                            <span>Reply</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500 transition group">
                            <div className="p-2 rounded-full group-hover:bg-green-900/20"><BsArrowRepeat /></div>
                            <span>Retweet</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-pink-500 transition group">
                            <div className="p-2 rounded-full group-hover:bg-pink-900/20"><BsHeart /></div>
                            <span>Like</span>
                        </button>
                        <button onClick={handleBookmark} className={`flex items-center space-x-2 hover:text-blue-500 transition group ${bookmarked ? 'text-blue-500' : ''}`}>
                            <div className="p-2 rounded-full group-hover:bg-blue-900/20">
                                {bookmarked ? <BsBookmarkFill /> : <BsBookmark />}
                            </div>
                            <span>Bookmark</span>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

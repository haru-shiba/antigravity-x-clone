'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Tweet from '@/components/Tweet';
import { useRouter } from 'next/navigation';

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        api.get('/user/profile', token).then(res => {
            setCurrentUser(res.user);
        }).catch(() => { });

        api.get('/bookmarks/', token).then(res => {
            setBookmarks(res.bookmarks || []);
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    }, [router]);

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div>
            <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-gray-800 z-10">
                <h1 className="text-xl font-bold">Bookmarks</h1>
                <p className="text-sm text-gray-500">@{currentUser?.username}</p>
            </div>
            <div>
                {bookmarks.length === 0 && <p className="p-4 text-center text-gray-500">No bookmarks yet</p>}
                {bookmarks.map((bookmark) => (
                    <Tweet
                        key={bookmark.id}
                        tweet={bookmark.tweet}
                        currentUser={currentUser}
                        isBookmarked={true}
                    />
                ))}
            </div>
        </div>
    );
}

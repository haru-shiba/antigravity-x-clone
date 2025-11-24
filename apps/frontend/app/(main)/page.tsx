'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Tweet from '@/components/Tweet';
import CreateTweet from '@/components/CreateTweet';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const [tweets, setTweets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const router = useRouter();

    const fetchTweets = async () => {
        try {
            const res = await api.get('/tweets/');
            setTweets(res.tweets || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch current user (mock or real endpoint needed)
        // For now, we decode token or just fetch profile
        api.get('/user/profile', token).then(res => {
            setCurrentUser(res.user);
        }).catch(() => { });

        fetchTweets();
    }, [router]);

    const handleTweetCreated = () => {
        fetchTweets();
    };

    const handleTweetDeleted = (id: number) => {
        setTweets(tweets.filter(t => t.id !== id));
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div>
            <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-gray-800 z-10">
                <h1 className="text-xl font-bold">Home</h1>
            </div>
            <CreateTweet onTweetCreated={handleTweetCreated} />
            <div>
                {tweets.map((tweet) => (
                    <Tweet
                        key={tweet.id}
                        tweet={tweet}
                        currentUser={currentUser}
                        onDelete={handleTweetDeleted}
                    />
                ))}
            </div>
        </div>
    );
}

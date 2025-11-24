'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Tweet from '@/components/Tweet';
import CreateReply from '@/components/CreateReply';
import { useParams, useRouter } from 'next/navigation';

import { BsArrowLeft } from 'react-icons/bs';

export default function TweetDetailPage() {
    const params = useParams();
    const [tweet, setTweet] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const router = useRouter();

    const id = params.id;

    const fetchData = async () => {
        try {
            // We don't have a single tweet endpoint in routes/tweet.go yet!
            const tweetRes = await api.get(`/tweets/${id}`);
            setTweet(tweetRes.tweet);

            const repliesRes = await api.get(`/tweets/${id}/replies`);
            setReplies(repliesRes.replies || []);
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

        api.get('/user/profile', token).then(res => {
            setCurrentUser(res.user);
        }).catch(() => { });

        if (id) fetchData();
    }, [id, router]);

    const handleReplyCreated = () => {
        fetchData();
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (!tweet) return <div className="p-4 text-center">Tweet not found</div>;

    return (
        <div>
            <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-gray-800 z-10 flex items-center">
                <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-800 rounded-full transition">
                    <BsArrowLeft className="text-xl" />
                </button>
                <h1 className="text-xl font-bold">Tweet</h1>
            </div>
            <Tweet tweet={tweet} currentUser={currentUser} />
            <CreateReply tweetId={Number(id)} onReplyCreated={handleReplyCreated} />
            <div>
                {replies.map((reply) => (
                    <div key={reply.id} className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition ml-4 border-l border-gray-800">
                        <div className="flex space-x-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold">{reply.user?.username || 'Unknown'}</span>
                                    <span className="text-gray-500 text-sm">@{reply.user?.username}</span>
                                    <span className="text-gray-500 text-sm">· {new Date(reply.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="mt-1 text-white whitespace-pre-wrap">{reply.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

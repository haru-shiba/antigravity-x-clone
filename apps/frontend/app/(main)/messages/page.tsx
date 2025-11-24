'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
    const [dms, setDms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [receiverId, setReceiverId] = useState('');
    const [content, setContent] = useState('');
    const router = useRouter();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const userRes = await api.get('/user/profile', token);
            setCurrentUser(userRes.user);

            const dmsRes = await api.get('/dms/', token);
            setDms(dmsRes.dms || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const handleSendDM = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiverId || !content.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await api.post('/dms/', { receiver_id: Number(receiverId), content }, token || '');
            setContent('');
            fetchData();
            alert('DM sent');
        } catch (err) {
            alert('Failed to send DM');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div>
            <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-gray-800 z-10">
                <h1 className="text-xl font-bold">Messages</h1>
            </div>
            <div className="p-4 border-b border-gray-800">
                <h2 className="font-bold mb-2">Send New Message</h2>
                <form onSubmit={handleSendDM} className="space-y-2">
                    <input
                        type="number"
                        placeholder="Receiver User ID"
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 outline-none"
                    />
                    <textarea
                        placeholder="Message"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 outline-none resize-none"
                        rows={2}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-bold transition"
                    >
                        Send
                    </button>
                </form>
            </div>
            <div>
                {dms.map((dm) => {
                    const isMe = dm.sender_id === currentUser?.id;
                    return (
                        <div key={dm.id} className={`p-4 border-b border-gray-800 ${isMe ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block max-w-xs p-3 rounded-xl ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>
                                <p className="text-xs opacity-75 mb-1">
                                    {isMe ? 'To: ' + dm.receiver?.username : 'From: ' + dm.sender?.username}
                                </p>
                                <p>{dm.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{new Date(dm.created_at).toLocaleString()}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

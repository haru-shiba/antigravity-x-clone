'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface CreateReplyProps {
    tweetId: number;
    onReplyCreated: () => void;
}

export default function CreateReply({ tweetId, onReplyCreated }: CreateReplyProps) {
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await api.post(`/tweets/${tweetId}/replies`, { content }, token || '');
            setContent('');
            onReplyCreated();
        } catch (err) {
            alert('Failed to post reply');
        }
    };

    return (
        <div className="p-4 border-b border-gray-800">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full bg-transparent text-lg placeholder-gray-500 outline-none resize-none"
                    placeholder="Post your reply"
                    rows={2}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-full font-bold transition"
                    >
                        Reply
                    </button>
                </div>
            </form>
        </div>
    );
}

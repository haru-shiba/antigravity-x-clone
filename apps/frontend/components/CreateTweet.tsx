'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface CreateTweetProps {
    onTweetCreated: () => void;
}

export default function CreateTweet({ onTweetCreated }: CreateTweetProps) {
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await api.post('/tweets/', { content }, token || '');
            setContent('');
            onTweetCreated();
        } catch (err) {
            alert('Failed to post tweet');
        }
    };

    return (
        <div className="p-4 border-b border-gray-800">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full bg-transparent text-xl placeholder-gray-500 outline-none resize-none"
                    placeholder="What is happening?!"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-full font-bold transition"
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
}

import { useState } from 'react';

type ReplyFormProps = {
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
};

export const ReplyForm = ({ onSubmit, onCancel, isLoading }: ReplyFormProps) => {
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        await onSubmit(content);
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 bg-gray-50 p-4 rounded-lg">
            <textarea
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-500"
                rows={2}
                placeholder="Tweet your reply"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={140}
                required
            />
            <div className="flex justify-end items-center mt-2 space-x-2">
                <span className="text-xs text-gray-500">{content.length}/140</span>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 font-bold py-1 px-3 rounded text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-full text-sm disabled:opacity-50"
                >
                    {isLoading ? 'Replying...' : 'Reply'}
                </button>
            </div>
        </form>
    );
};

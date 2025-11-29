import { useState } from 'react';

type CreatePostFormProps = {
    onSubmit: (content: string) => Promise<void>;
    isLoading: boolean;
};

export const CreatePostForm = ({ onSubmit, isLoading }: CreatePostFormProps) => {
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        await onSubmit(content);
        setContent('');
    };

    return (
        <div className="border-b border-[var(--border-color)] p-4">
            <div className="flex space-x-4">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                </div>
                <div className="flex-grow">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            className="w-full bg-transparent text-xl placeholder-gray-500 text-white focus:outline-none resize-none min-h-[50px] py-2"
                            rows={2}
                            placeholder="What is happening?!"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={280}
                        />
                        <div className="flex justify-between items-center mt-2 border-t border-[var(--border-color)] pt-3">
                            <div className="flex space-x-4 text-[var(--accent-color)]">
                                {/* Icons (Image only) */}
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current cursor-pointer"><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !content.trim()}
                                className="bg-[var(--accent-color)] hover:bg-[#1a8cd8] text-white font-bold py-1.5 px-4 rounded-full disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

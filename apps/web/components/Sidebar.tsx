'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="fixed h-screen w-[275px] flex flex-col justify-between py-4 px-2 border-r border-[var(--border-color)]">
            <div className="flex flex-col space-y-2">
                {/* Logo */}
                <Link href="/" className="p-3 w-fit hover:bg-[var(--hover-bg)] rounded-full transition-colors">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-white">
                        <g>
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </g>
                    </svg>
                </Link>

                {/* Navigation Items */}
                <nav className="flex flex-col space-y-2">
                    <Link href="/" className="flex items-center space-x-4 p-3 w-fit hover:bg-[var(--hover-bg)] rounded-full transition-colors">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-white">
                            <g><path d="M22.46 7.57L12.357 2.115c-.223-.12-.49-.12-.713 0L1.543 7.57c-.364.197-.506.652-.323 1.014.182.36.633.512 1.01.316l.77-.416V16.5c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V8.484l.77.415c.38.196.828.045 1.01-.316.183-.362.04-.817-.323-1.013zM19 16.5c0 .26-.13.5-.4.5h-4V11h-5.2v6H5.4c-.27 0-.4-.24-.4-.5V7.62l7-3.78 7 3.78V16.5z"></path></g>
                        </svg>
                        <span className="text-xl font-bold">Home</span>
                    </Link>
                    <Link href="/profile" className="flex items-center space-x-4 p-3 w-fit hover:bg-[var(--hover-bg)] rounded-full transition-colors">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-white">
                            <g><path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zm-5.863-3.44c-2.485 0-4.5-2.018-4.5-4.5S9.515 1 12 1s4.5 2.018 4.5 4.5-2.015 4.5-4.5 4.5z"></path></g>
                        </svg>
                        <span className="text-xl">Profile</span>
                    </Link>
                    <Link href="/bookmarks" className="flex items-center space-x-4 p-3 w-fit hover:bg-[var(--hover-bg)] rounded-full transition-colors">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-white">
                            <g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g>
                        </svg>
                        <span className="text-xl">Bookmarks</span>
                    </Link>
                </nav>

                {/* Post Button */}
                <button className="bg-[var(--accent-color)] hover:bg-[#1a8cd8] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors mt-4 w-[90%] text-lg">
                    Post
                </button>
            </div>

            {/* User Menu */}
            {user && (
                <div className="flex items-center space-x-3 p-3 hover:bg-[var(--hover-bg)] rounded-full cursor-pointer transition-colors mb-4">
                    <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                    <div className="flex flex-col">
                        <span className="font-bold">{user.username}</span>
                        <span className="text-[var(--border-color)]">@{user.username}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

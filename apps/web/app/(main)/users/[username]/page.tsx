'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUserProfile } from '@/features/users/api/usersApi';
import { Timeline } from '@/features/timeline/components/Timeline';
import Link from 'next/link';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile(username);
                setUser(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (isLoading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    if (!user) return <div className="text-center p-8">User not found</div>;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-1 border-b border-[var(--border-color)] flex items-center space-x-4">
                <Link href="/" className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-white"><g><path d="M7.414 13l5.043 5.04-1.414 1.414L3.586 12l7.457-7.454 1.414 1.414L7.414 11H21v2H7.414z"></path></g></svg>
                </Link>
                <div>
                    <h1 className="font-bold text-xl leading-5">{user.username}</h1>
                    <div className="text-xs text-gray-500">{ }</div>
                </div>
            </div>

            {/* Banner */}
            <div className="h-48 bg-[#333639]"></div>

            {/* Profile Info */}
            <div className="px-4 pb-4 border-b border-[var(--border-color)]">
                <div className="flex justify-between items-start">
                    <div className="-mt-16 mb-3">
                        <div className="h-32 w-32 bg-gray-600 rounded-full border-4 border-black"></div>
                    </div>
                    <div className="mt-3">
                        <button className="bg-transparent border border-[var(--border-color)] text-white font-bold py-1.5 px-4 rounded-full hover:bg-[var(--hover-bg)] transition-colors">
                            Edit profile
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <h2 className="font-bold text-xl leading-6">{user.username}</h2>
                    <div className="text-gray-500">@{user.username}</div>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 mr-1 fill-current"><g><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.11 21 3 19.88 3 18.5v-12C3 5.12 4.11 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path></g></svg>
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-4 text-sm">
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-white">0</span> <span className="text-gray-500">Following</span>
                    </div>
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-white">0</span> <span className="text-gray-500">Followers</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border-color)]">
                <div className="flex-1 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer p-4 text-center font-bold relative">
                    Posts
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-[var(--accent-color)] rounded-full"></div>
                </div>
                <div className="flex-1 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
                    Replies
                </div>
                <div className="flex-1 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
                    Highlights
                </div>
                <div className="flex-1 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
                    Media
                </div>
                <div className="flex-1 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
                    Likes
                </div>
            </div>

            <Timeline userId={user.id} showPostForm={false} />
        </div>
    );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BsHouseDoorFill, BsBookmark, BsEnvelope, BsPerson, BsTwitterX } from 'react-icons/bs';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
        // Ideally fetch user profile here to get username/id
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-black text-white flex justify-center">
            <div className="w-full max-w-7xl flex">
                {/* Sidebar */}
                <div className="w-64 p-4 border-r border-gray-800 hidden md:flex flex-col justify-between h-screen sticky top-0">
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-bold px-4 flex items-center space-x-2">
                            <BsTwitterX className="text-3xl" />
                        </Link>
                        <nav className="space-y-2">
                            <Link href="/" className="flex items-center space-x-4 py-3 px-4 text-xl hover:bg-gray-900 rounded-full transition">
                                <BsHouseDoorFill className="text-2xl" />
                                <span>Home</span>
                            </Link>
                            <Link href="/bookmarks" className="flex items-center space-x-4 py-3 px-4 text-xl hover:bg-gray-900 rounded-full transition">
                                <BsBookmark className="text-2xl" />
                                <span>Bookmarks</span>
                            </Link>
                            <Link href="/messages" className="flex items-center space-x-4 py-3 px-4 text-xl hover:bg-gray-900 rounded-full transition">
                                <BsEnvelope className="text-2xl" />
                                <span>Messages</span>
                            </Link>
                            <Link href="/profile" className="flex items-center space-x-4 py-3 px-4 text-xl hover:bg-gray-900 rounded-full transition">
                                <BsPerson className="text-2xl" />
                                <span>Profile</span>
                            </Link>
                        </nav>
                    </div>
                    <button onClick={handleLogout} className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold transition">
                        Logout
                    </button>
                </div>

                {/* Main Content */}
                <main className="flex-1 border-r border-gray-800 min-h-screen">
                    {children}
                </main>

                {/* Right Sidebar (Placeholder) */}
                <div className="w-80 p-4 hidden lg:block">
                    <div className="bg-gray-900 rounded-xl p-4">
                        <h2 className="font-bold text-xl mb-4">What's happening</h2>
                        <p className="text-gray-500">Trending topics would go here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

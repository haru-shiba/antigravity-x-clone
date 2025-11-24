'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        api.get('/user/profile', token).then(res => {
            setUser(res.user);
        }).catch(() => {
            router.push('/login');
        }).finally(() => {
            setLoading(false);
        });
    }, [router]);

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete('/user/delete', token || '');
            localStorage.removeItem('token');
            router.push('/login');
        } catch (err) {
            alert('Failed to delete account');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (!user) return <div className="p-4 text-center">User not found</div>;

    return (
        <div>
            <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-gray-800 z-10">
                <h1 className="text-xl font-bold">{user.username}</h1>
                <p className="text-sm text-gray-500">0 posts</p>
            </div>
            <div className="p-4">
                <div className="w-24 h-24 bg-gray-700 rounded-full mb-4"></div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-gray-500">@{user.username}</p>
                <p className="text-gray-500 mt-2">Joined {new Date(user.created_at).toLocaleDateString()}</p>

                <div className="mt-6">
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-900/20 rounded-full font-bold transition"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { username, email, password });
            router.push('/login');
        } catch (err: any) {
            setError('Signup failed: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl">
                <h1 className="text-3xl font-bold text-center">Join X Clone</h1>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-bold transition"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="text-center text-gray-400">
                    Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/users/components/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/home');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Logo (Hidden on mobile, visible on large screens) */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[300px] w-[300px] fill-white">
                    <g>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </g>
                </svg>
            </div>

            {/* Right Side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16">
                <div className="max-w-[600px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-12">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-12 w-12 fill-white">
                            <g>
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </g>
                        </svg>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold mb-12 tracking-tight">
                        Happening now
                    </h1>

                    <h2 className="text-3xl font-bold mb-8">
                        Join today.
                    </h2>

                    <div className="w-[300px] space-y-4">
                        {/* Mock Google Button */}
                        <button className="w-full bg-white text-black rounded-full py-2 px-4 font-bold flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <span className="mr-2">G</span>
                            Sign up with Google
                        </button>

                        {/* Mock Apple Button */}
                        <button className="w-full bg-white text-black rounded-full py-2 px-4 font-bold flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <span className="mr-2"></span>
                            Sign up with Apple
                        </button>

                        <div className="flex items-center my-4">
                            <div className="flex-grow border-t border-[var(--border-color)]"></div>
                            <span className="px-2 text-gray-500 text-sm">or</span>
                            <div className="flex-grow border-t border-[var(--border-color)]"></div>
                        </div>

                        <button
                            onClick={() => setShowRegister(true)}
                            className="block w-full bg-[var(--accent-color)] text-white rounded-full py-2 px-4 font-bold text-center hover:bg-[#1a8cd8] transition-colors"
                        >
                            Create account
                        </button>

                        <p className="text-[11px] text-gray-500 leading-tight">
                            By signing up, you agree to the <span className="text-[var(--accent-color)]">Terms of Service</span> and <span className="text-[var(--accent-color)]">Privacy Policy</span>, including <span className="text-[var(--accent-color)]">Cookie Use</span>.
                        </p>

                        <div className="mt-12">
                            <h3 className="font-bold mb-4">Already have an account?</h3>
                            <button
                                onClick={() => setShowLogin(true)}
                                className="block w-full bg-transparent border border-[var(--border-color)] text-[var(--accent-color)] rounded-full py-2 px-4 font-bold text-center hover:bg-[rgba(29,155,240,0.1)] transition-colors"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
                <LoginForm />
            </Modal>

            <Modal isOpen={showRegister} onClose={() => setShowRegister(false)}>
                <RegisterForm />
            </Modal>
        </div>
    );
}

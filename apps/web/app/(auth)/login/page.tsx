'use client';

import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
                <LoginForm />
            </div>
        </div>
    );
}

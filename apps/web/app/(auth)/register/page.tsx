'use client';

import { RegisterForm } from '@/features/users/components/RegisterForm';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
                <RegisterForm />
            </div>
        </div>
    );
}

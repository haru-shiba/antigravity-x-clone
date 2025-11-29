import { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useRouter } from 'next/navigation';

export const LoginForm = () => {
    const { loginUser, isLoading, error } = useLogin();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginUser(formData.email, formData.password);
            router.push('/home');
        } catch (err) {
            // Error is handled by the hook
        }
    };

    return (
        <div className="w-full max-w-[364px] mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white">Sign in to X</h2>

            {/* Mock Social Buttons */}
            <div className="space-y-4 mb-4">
                <button className="w-full bg-white text-black rounded-full py-2 px-4 font-bold flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <span className="mr-2">G</span>
                    Sign in with Google
                </button>
                <button className="w-full bg-white text-black rounded-full py-2 px-4 font-bold flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <span className="mr-2"></span>
                    Sign in with Apple
                </button>
            </div>

            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-[var(--border-color)]"></div>
                <span className="px-2 text-white text-sm">or</span>
                <div className="flex-grow border-t border-[var(--border-color)]"></div>
            </div>

            {error && (
                <div className="text-red-500 text-sm mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                    <input
                        className="block w-full bg-black border border-[var(--border-color)] rounded text-white px-2 pt-6 pb-2 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] peer"
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder=" "
                    />
                    <label
                        htmlFor="email"
                        className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                    >
                        Phone, email, or username
                    </label>
                </div>

                <div className="relative group">
                    <input
                        className="block w-full bg-black border border-[var(--border-color)] rounded text-white px-2 pt-6 pb-2 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] peer"
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder=" "
                    />
                    <label
                        htmlFor="password"
                        className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                    >
                        Password
                    </label>
                </div>

                <button
                    className="bg-white text-black font-bold py-2.5 px-4 rounded-full w-full hover:bg-gray-200 transition-colors mt-4"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging In...' : 'Next'}
                </button>

                <button
                    type="button"
                    className="w-full bg-black border border-[var(--border-color)] text-white font-bold py-2.5 px-4 rounded-full hover:bg-[rgba(239,243,244,0.1)] transition-colors mt-4"
                >
                    Forgot password?
                </button>
            </form>

            <p className="mt-12 text-gray-500 text-sm">
                Don't have an account? <a href="/register" className="text-[var(--accent-color)] hover:underline">Sign up</a>
            </p>
        </div>
    );
};

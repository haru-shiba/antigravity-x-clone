import { useState } from 'react';
import { useCreateUser } from '../hooks/useCreateUser';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
    const { register, isLoading, error } = useCreateUser();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [useEmail, setUseEmail] = useState(false);

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
            router.push('/home');
        } catch (err) {
            // Error is handled by the hook and displayed below
        }
    };

    return (
        <div className="w-full max-w-[440px] mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white">Create your account</h2>

            {error && (
                <div className="text-red-500 text-sm mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                    <input
                        className="block w-full bg-black border border-[var(--border-color)] rounded text-white px-2 pt-6 pb-2 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] peer"
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        minLength={3}
                        placeholder=" "
                        maxLength={50}
                    />
                    <label
                        htmlFor="username"
                        className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                    >
                        Name
                    </label>
                    <div className="absolute top-4 right-2 text-gray-500 text-sm hidden group-focus-within:block">
                        {formData.username.length} / 50
                    </div>
                </div>

                <div className="relative group">
                    <input
                        className="block w-full bg-black border border-[var(--border-color)] rounded text-white px-2 pt-6 pb-2 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] peer"
                        id="email"
                        type={useEmail ? "email" : "tel"}
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
                        {useEmail ? "Email" : "Phone"}
                    </label>
                </div>

                <div
                    className="text-[var(--accent-color)] text-sm cursor-pointer hover:underline text-right"
                    onClick={() => setUseEmail(!useEmail)}
                >
                    {useEmail ? "Use phone instead" : "Use email instead"}
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
                        minLength={8}
                        placeholder=" "
                    />
                    <label
                        htmlFor="password"
                        className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                    >
                        Password
                    </label>
                </div>

                <div>
                    <h3 className="font-bold mb-1">Date of birth</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
                    </p>
                    <div className="flex space-x-3">
                        <select
                            className="flex-grow bg-black border border-[var(--border-color)] text-white rounded h-14 px-2 focus:outline-none focus:border-[var(--accent-color)]"
                            defaultValue=""
                        >
                            <option value="" disabled>Month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            className="w-24 bg-black border border-[var(--border-color)] text-white rounded h-14 px-2 focus:outline-none focus:border-[var(--accent-color)]"
                            defaultValue=""
                        >
                            <option value="" disabled>Day</option>
                            {Array.from({ length: 31 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <select
                            className="w-32 bg-black border border-[var(--border-color)] text-white rounded h-14 px-2 focus:outline-none focus:border-[var(--accent-color)]"
                            defaultValue=""
                        >
                            <option value="" disabled>Year</option>
                            {Array.from({ length: 100 }, (_, i) => (
                                <option key={i} value={new Date().getFullYear() - i}>
                                    {new Date().getFullYear() - i}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-12">
                    <button
                        className="bg-white text-black font-bold py-3 px-4 rounded-full w-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing Up...' : 'Next'}
                    </button>
                </div>
            </form>
        </div>
    );
};

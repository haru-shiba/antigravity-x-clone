import Link from 'next/link';

export const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-white text-xl font-bold">
                    X Clone
                </Link>
                <div className="space-x-4">
                    <Link href="/" className="text-gray-300 hover:text-white">
                        Home
                    </Link>
                    <Link href="/login" className="text-gray-300 hover:text-white">
                        Login
                    </Link>
                    <Link href="/register" className="text-gray-300 hover:text-white">
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
};

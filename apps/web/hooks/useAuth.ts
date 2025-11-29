import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../features/users/api/usersApi';
import { UserResponse } from '../features/users/types/user';

export const useAuth = () => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await getMe();
                setUser(userData);
            } catch (error) {
                // If 401 or any error, redirect to landing page
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    return { user, isLoading };
};

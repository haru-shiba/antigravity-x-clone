import { useState } from 'react';
import { login } from '../api/authApi';
import { UserResponse } from '../../users/types/user';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserResponse | null>(null);

    const loginUser = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await login(email, password);
            setUser(response);
            return response;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { loginUser, isLoading, error, user };
};

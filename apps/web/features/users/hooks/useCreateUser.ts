import { useState } from 'react';
import { createUser } from '../api/usersApi';
import { CreateUserRequest, UserResponse } from '../types/user';

export const useCreateUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserResponse | null>(null);

    const register = async (data: CreateUserRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await createUser(data);
            setUser(response);
            return response;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading, error, user };
};

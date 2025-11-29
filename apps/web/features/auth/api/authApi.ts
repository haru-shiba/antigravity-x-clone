import { UserResponse } from '../../users/types/user';

const API_URL = 'http://localhost:8080/api';

export const login = async (email: string, password: string): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
    }

    return response.json();
};

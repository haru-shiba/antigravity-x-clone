import { CreateUserRequest, UserResponse } from '../types/user';

const API_URL = 'http://localhost:8080/api';

export const createUser = async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
    }

    return response.json();
};

export const getUserProfile = async (username: string): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/users/${username}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user profile');
    }

    return response.json();
};

export const getMe = async (): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/me`, {
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch current user profile');
    }

    return response.json();
};

export type User = {
  id: number;
  username: string;
  email: string;
  bio: string;
  created_at: string;
  updated_at: string;
};

export type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
};

export type UserResponse = User;

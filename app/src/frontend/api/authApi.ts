import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';
import { User } from '../models/user';

export interface UserLoginPayload {
    username: string;
    password: string;
}

export interface UserSignupPayload {
    username: string;
    email: string;
    confirmEmail: string;
    password: string;
}

export type UserLoginData = UserLoginPayload;
export type UserSignupData = UserSignupPayload;

export interface AuthApiResponse {
    success?: boolean;
    error?: string;
    [key: string]: any;
}

export interface PasswordResetResponse {
    success?: boolean;
    error?: string;
}

export const authApi = {
    login: (payload: UserLoginPayload): Promise<AuthApiResponse> =>
        apiPost<AuthApiResponse>('/api/login', payload),

    logout: (): Promise<AuthApiResponse> =>
        apiPost<AuthApiResponse>('/api/logout'),

    signup: (payload: UserSignupPayload): Promise<AuthApiResponse> =>
        apiPost<AuthApiResponse>('/api/users', {
            username: payload.username,
            email: payload.email,
            confirm_email: payload.confirmEmail,
            password: payload.password
        }),

    getMe: (): Promise<User & { error?: string }> =>
        apiGet<User & { error?: string }>('/api/users/me'),

    generateApiKey: (): Promise<AuthApiResponse> =>
        apiPost<AuthApiResponse>('/api/api/key'),

    deleteAccount: (): Promise<AuthApiResponse> =>
        apiDelete<AuthApiResponse>('/api/users/me'),

    requestPasswordReset: (email: string): Promise<PasswordResetResponse> =>
        apiPut<PasswordResetResponse>('/api/users/password', { email }),

    resetPassword: (payload: { token: string; password: string }): Promise<PasswordResetResponse> =>
        apiPut<PasswordResetResponse>('/api/users/password', payload)
};

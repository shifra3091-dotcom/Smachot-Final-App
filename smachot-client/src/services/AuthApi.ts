import axiosInstance from './axiosInstance';

// Use the baseURL from axiosInstance if set, otherwise fallback to window.location.origin
const baseURL = axiosInstance.defaults?.baseURL || window.location.origin;
import type { User } from '../types/User';

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    name: string;
}

export interface AuthResultDto {
    Success: boolean;
    Message: string;
    User?: User;
    Token?: string;
}

export const authApi = {
    async login(loginDto: LoginDto): Promise<AuthResultDto> {
        const response = await axiosInstance.post(
            '/api/app/auth/login',
            loginDto
        );
        return response.data;
    },

    async register(registerDto: RegisterDto): Promise<AuthResultDto> {
        const response = await axiosInstance.post(
            '/api/app/auth/register',
            registerDto
        );
        return response.data;
    },

    async logout(): Promise<void> {
        await axiosInstance.post(
            '/api/app/auth/logout',
            {}
        );
    },

    async getCurrentUser(): Promise<{ Success: boolean; User?: User }> {
        const response = await axiosInstance.get(
            '/api/app/auth/current-user'
        );
        return response.data;
    },


    async isAuthenticated(): Promise<{ isAuthenticated: boolean }> {
        const response = await axiosInstance.get(
            '/api/app/auth/is-authenticated'
        );
        return response.data;
    },


        async loginGoogle() {
                console.log("opening popup");
                // Open a popup window for the login flow.
                const popup = window.open(
                        baseURL + "/api/app/auth/login-google", // Updated ASP.NET challenge page URL
                        "GoogleLogin",
                        "width=600,height=600"
                );
        },

        async loginApple() {
                console.log("opening popup");
                // Open a popup window for the login flow.
                const popup = window.open(
                        baseURL + "/api/app/auth/login-apple", // Updated ASP.NET challenge page URL
                        "AppleLogin",
                        "width=600,height=600"
                );
        },
};

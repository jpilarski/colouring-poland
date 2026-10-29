import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { authApi } from './api';
import type { UserLoginData, UserSignupData } from './api';
import { User } from './models/user';

export type { UserLoginData, UserSignupData };

interface AuthContextState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User;
    userError: string;
    login: (data: UserLoginData, cb?: (err) => void) => void;
    logout: (cb?: (err) => void) => void;
    signup: (data: UserSignupData, cb?: (err) => void) => void;
    generateApiKey: (cb?: (err) => void) => void;
    deleteAccount: (cb?: (err) => void) => void;
}

const stub = (): never => {
    throw new Error('AuthProvider not set up');
};

export const AuthContext = createContext<AuthContextState>({
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    userError: undefined,
    login: stub,
    logout: stub,
    signup: stub,
    generateApiKey: stub,
    deleteAccount: stub,
});

const noop = () => { };

interface AuthProviderProps {
    preloadedUser?: User;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
    children,
    preloadedUser
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(preloadedUser != undefined);
    const [user, setUser] = useState<User>(preloadedUser);
    const [userError, setUserError] = useState<string>(undefined);
    const [isLoading, setIsLoading] = useState(false);


    const login = useCallback(async (data: UserLoginData, cb: (err) => void = noop) => {
        if (isAuthenticated) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await authApi.login(data);

            if (res.error) {
                setIsLoading(false);
                cb(res.error);
            } else {
                setIsAuthenticated(true);
            }
        } catch (err: any) {
            setIsLoading(false);
            cb(err?.data?.error || 'Error logging in.');
        }
    }, [isAuthenticated]);

    const logout = useCallback(async (cb: (err) => void = noop) => {
        if (!isAuthenticated) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await authApi.logout();

            if (res.error) {
                setIsLoading(false);
                cb(res.error);
            } else {
                setIsAuthenticated(false);
            }
        } catch (err: any) {
            setIsLoading(false);
            cb(err?.data?.error || 'Error logging out');
        }

    }, [isAuthenticated]);

    const signup = useCallback(async (data: UserSignupData, cb: (err) => void = noop) => {
        if (isAuthenticated) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await authApi.signup(data);

            if (res.error) {
                setIsLoading(false);
                cb(res.error);
            } else {
                setIsAuthenticated(true);
            }
        } catch (err: any) {
            setIsLoading(false);
            cb(err?.data?.error || 'Error signing up.');
        }
    }, [isAuthenticated]);

    async function updateUserData(): Promise<void> {
        setUserError(undefined);
        setIsLoading(true);

        try {
            const userData = await authApi.getMe();
            if (userData.error) {
                setUserError(userData.error);
            } else {
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (err: any) {
            setUserError(err?.data?.error || 'Error loading user info.');
        }

        setIsLoading(false);
    }

    const generateApiKey = useCallback(async (cb: (err) => void = noop) => {
        try {
            const res = await authApi.generateApiKey();
            if (res.error) {
                cb(res.error);
            } else {
                updateUserData();
            }
        } catch (err: any) {
            cb(err?.data?.error || 'Error getting API key.');
        }
    }, []);

    const deleteAccount = useCallback(async (cb = noop) => {
        try {
            const data = await authApi.deleteAccount();
            if (data.error) {
                cb(data.error);
            } else {
                setIsAuthenticated(false);
            }
        } catch (err: any) {
            cb(err?.data?.error || 'Error deleting account.');
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            updateUserData();
        } else {
            setUser(undefined);
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // update user data initially to check if already logged in
    useEffect(() => {
        // if user state not preloaded
        if (user == undefined) {
            updateUserData();
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            userError,
            login,
            logout,
            signup,
            generateApiKey,
            deleteAccount,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextState => {
    return useContext(AuthContext);
};

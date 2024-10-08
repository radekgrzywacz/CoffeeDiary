import axios from "axios";
import { Platform } from "react-native";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";

interface AuthProps {
    authState?: {
        accessToken: string | null;
        refreshToken: string | null;
        authenticated: boolean | null;
    };
    onRegister?: (
        email: string,
        username: string,
        password: string,
        role: string
    ) => Promise<any>;
    onLogin?: (username: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

export const TOKEN_KEY = "coffee_diary-JWT-access";
export const REFRESH_TOKEN_KEY = "coffee_diary-JWT-refresh";
export const API_URL = Device.isDevice
    ? "http://192.168.68.105:6060"
    : Platform.OS === "android"
      ? "http://10.0.2.2:6060"
      : "http://localhost:6060";

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
    const [authState, setAuthState] = useState<{
        accessToken: string | null;
        refreshToken: string | null;
        authenticated: boolean | null;
    }>({
        accessToken: null,
        refreshToken: null,
        authenticated: null,
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const refreshToken =
                await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            console.log(
                "AuthContext.tsx: 55 ~ loadToken ~ stored token: ",
                token
            );

            const isAccessTokenExpired = checkTokenExpiry(token);

            if (isAccessTokenExpired) {
                const isRefreshTokenExpired = checkTokenExpiry(refreshToken);
                if (isRefreshTokenExpired) {
                    console.log("Refresh token not valid, loggin out");
                    logout();
                } else {
                    console.log(
                        "Refresh token valid, access expired, before refreshing..."
                    );
                    const response = await axios.post(
                        `${API_URL}/auth/refresh_token`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${refreshToken}`, // Correct headers placement
                            },
                        }
                    );
                    if (response) {
                        await SecureStore.setItemAsync(
                            TOKEN_KEY,
                            response.data.accessToken
                        );
                        await SecureStore.setItemAsync(
                            REFRESH_TOKEN_KEY,
                            response.data.refreshToken
                        );
                        console.log("Refreshed on login");
                        if (token) {
                            axios.defaults.headers.common["Authorization"] =
                                `Bearer ${token}`;

                            setAuthState({
                                accessToken: token,
                                refreshToken: refreshToken,
                                authenticated: true,
                            });
                        }
                    }
                }
            } else {
                if (token) {
                    axios.defaults.headers.common["Authorization"] =
                        `Bearer ${token}`;

                    setAuthState({
                        accessToken: token,
                        refreshToken: refreshToken,
                        authenticated: true,
                    });
                }
            }
        };

        loadToken();
    }, []);

    const checkTokenExpiry = (token: string | null) => {
        if (!token) return false;
        const decodedToken: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    };

    const register = async (
        username: string,
        email: string,
        password: string,
        role: string
    ) => {
        try {
            return await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password,
                role,
            });
        } catch (e: any) {
            console.log(e.response);
            const errorMessage = e.response.data.error || "An error occurred";
            return { error: true, msg: errorMessage };
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const result = await axios.post(`${API_URL}/auth/login`, {
                username,
                password,
            });

            console.log("AuthContext.tsx:95 ~ login ~ result:", result.data);

            setAuthState({
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
                authenticated: true,
            });
            console.log();

            axios.defaults.headers.common["Authorization"] =
                `Bearer ${result.data.accessToken}`;

            await SecureStore.setItemAsync(TOKEN_KEY, result.data.accessToken);
            await SecureStore.setItemAsync(
                REFRESH_TOKEN_KEY,
                result.data.refreshToken
            );

            return result;
        } catch (e: any) {
            console.log(e.response);
            const errorMessage = e.response.data.error || "An error occurred";
            return { error: true, msg: errorMessage };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

        axios.defaults.headers.common["Authorization"] = "";

        setAuthState({
            accessToken: null,
            refreshToken: null,
            authenticated: false,
        });
    };

    const value = {
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        authState,
    };
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

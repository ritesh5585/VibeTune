import { login as loginApi, register, logOut } from "../services/auth.api";
import { useContext } from "react";
import { AuthContext } from "../auth.context";

export const useAuth = () => {
    const { user, loading, login: contextLogin, logout: contextLogout } = useContext(AuthContext);

    async function handleRegister({ username, email, password }) {
        try {
            const data = await register({ username, email, password });
            if (data?.data?.token) {
                contextLogin(data.data, data.data.token);
                return { success: true };
            }
            return { success: false, message: "Invalid response from server" };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
            };
        }
    }

    async function handleLogin({ email, password }) {
        try {
            const data = await loginApi({ email, password });

            if (data?.data?.token) {
                contextLogin(data.data, data.data.token);
                return { success: true };
            }

            return { success: false, message: "Invalid response from server" };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
            };
        }
    }

    async function handleLogout() {
        try {
            await logOut();
        } catch {
        } finally {
            contextLogout();
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout };
};
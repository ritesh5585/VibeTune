import { login, register, logOut, getMe } from "../services/auth.api";
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";

export const useAuth = () => {
    const context = useContext(AuthContext)

    const { user, setUser, loading, setLoading, login: contextLogin, logout: contextLogout } = context

    async function handleRegister({ username, email, password }) {
        setLoading(true)

        try {
            const data = await register({ username, email, password })
            if (data.data && data.data.token) {
                contextLogin(data.data, data.data.token)
            } else {
                setUser(data.data)
            }
        } catch (error) {
            console.error('Registration error:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    async function handleLogin({ email, password }) {
        try {
            setLoading(true);

            const data = await login({ email, password });

            if (data.data && data.data.token) {
                contextLogin(data.data, data.data.token)
            } else {
                setUser(data.data)
            }

            return {
                success: true,
                user: data.data,
            };

        } catch (error) {
            console.log("LOGIN ERROR:", error);

            return {
                success: false,
                message: error.response?.data?.message || error.message,
            };

        } finally {
            setLoading(false);
        }
    }

    async function handleGetMe() {
        if (!user || !user.token) return;
        
        try {
            setLoading(true)
            const data = await getMe()
            if (data.data) {
                setUser(prev => ({ ...prev, ...data.data }))
            }
        } catch (error) {
            console.error('Get me error:', error)
            // If token is invalid, logout
            contextLogout()
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        try {
            setLoading(true)
            await logOut()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            contextLogout()
        }
    }

    // Only call getMe if we have a token
    useEffect(() => {
        if (user && user.token) {
            handleGetMe()
        }
    }, [user?.token]) // Only depend on token

    return ({
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
        handleGetMe
    })
}

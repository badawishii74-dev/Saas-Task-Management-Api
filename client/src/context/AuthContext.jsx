import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const getUser = () => {
        try {
            const token = localStorage.getItem('token');
            return token ? jwtDecode(token) : null;
        } catch {
            return null;
        }
    };

    const [user, setUser] = useState(getUser);

    const login = (token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);  // save refresh token
        setUser(jwtDecode(token));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');  //  clear refresh token
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
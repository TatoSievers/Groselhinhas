import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        // Check for redirect result on page load
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    console.log('Login successful:', result.user.displayName);
                }
            })
            .catch((error) => {
                console.error('Redirect result error:', error);
            });

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth) {
            alert('Firebase não está configurado. Configure as variáveis de ambiente para habilitar o login.');
            return;
        }

        const provider = new GoogleAuthProvider();
        try {
            // Use redirect instead of popup - more reliable for localhost
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = () => {
        if (!auth) return Promise.resolve();
        return signOut(auth);
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

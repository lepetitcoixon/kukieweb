
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'kukieUsers';
const LOGGED_IN_USER_STORAGE_KEY = 'kukieLoggedInUser';
const ADMIN_EMAIL = 'admin@kukie.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(LOGGED_IN_USER_STORAGE_KEY);
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing stored user:", e);
      localStorage.removeItem(LOGGED_IN_USER_STORAGE_KEY);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOGGED_IN_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOGGED_IN_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const getUsers = (): User[] => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    try {
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
      console.error("Error parsing users from storage:", e);
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    return new Promise(resolve => {
      setTimeout(() => {
        const users = getUsers();
        let adminUser = users.find(u => u.email === ADMIN_EMAIL);
        if (email === ADMIN_EMAIL && !adminUser) {
          const newAdmin: User = { 
            id: `user-admin-${Date.now()}`, 
            name: 'Admin Kukie', 
            email: ADMIN_EMAIL, 
            password: password, // In a real app, hash passwords!
            isAdmin: true,
            address: 'Kukie Main Kitchen St.'
          };
          users.push(newAdmin);
          saveUsers(users);
          adminUser = newAdmin;
        }

        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          setCurrentUser(user);
          setIsLoading(false);
          resolve(true);
        } else {
          setError('Email o contraseña incorrectos.');
          setIsLoading(false);
          resolve(false);
        }
      }, 500);
    });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, pickupPointName?: string, address?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    return new Promise(resolve => {
      setTimeout(() => {
        let users = getUsers();
        if (users.find(u => u.email === email)) {
          setError('Este correo electrónico ya está registrado.');
          setIsLoading(false);
          resolve(false);
        } else {
          const newUser: User = { 
            id: `user-${Date.now()}`, 
            name, 
            email, 
            password, // In a real app, hash passwords!
            isAdmin: email === ADMIN_EMAIL,
            isPickupPoint: !!pickupPointName,
            pickupPointName: pickupPointName || undefined,
            address: address || undefined // User's address, or pickup point's address
          };
          users.push(newUser);
          saveUsers(users);
          setCurrentUser(newUser);
          setIsLoading(false);
          resolve(true);
        }
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const isAdmin = useCallback((): boolean => {
    return !!currentUser && currentUser.isAdmin === true;
  }, [currentUser]);

  const isPickupPointUser = useCallback((): boolean => {
    return !!currentUser && currentUser.isPickupPoint === true;
  }, [currentUser]);

  const updateUser = useCallback(async (userId: string, updatedUserData: Partial<Omit<User, 'id' | 'password'>>): Promise<boolean> => {
    setIsLoading(true);
    return new Promise(resolve => {
        setTimeout(() => {
            let users = getUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex > -1) {
                users[userIndex] = { ...users[userIndex], ...updatedUserData };
                saveUsers(users);
                if (currentUser && currentUser.id === userId) {
                    setCurrentUser(users[userIndex]);
                }
                setIsLoading(false);
                resolve(true);
            } else {
                setError("Usuario no encontrado para actualizar.");
                setIsLoading(false);
                resolve(false);
            }
        }, 300);
    });
  }, [currentUser]);

  const getAllUsers = useCallback((): User[] => {
    return getUsers();
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, isLoading, error, login, register, logout, isAdmin, isPickupPointUser, updateUser, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

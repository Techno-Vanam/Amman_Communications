'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  handle: string;
  initials: string;
  dob?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  occupation?: string;
  altPhone?: string;
  emergencyContact?: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
}

const DEFAULT_JAI_USER: UserProfile = {
  name: 'Jai',
  email: 'jai@gmail.com',
  phone: '+91 ',
  address: '',
  handle: '@jai',
  initials: 'J',
  dob: '',
  aadhaarNumber: '',
  panNumber: '',
  occupation: '',
  altPhone: '+91 ',
  emergencyContact: ''
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_JAI_USER);

  useEffect(() => {
    // Load persisted user from localStorage if available
    try {
      const savedUser = localStorage.getItem('amman_user_profile');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser({
          ...parsed,
          phone: parsed.phone || '+91 ',
          altPhone: parsed.altPhone || '+91 '
        });
      } else {
        const savedEmail = localStorage.getItem('user_email');
        if (savedEmail) {
          const derivedName = savedEmail.split('@')[0].replace('.', ' ');
          const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
          const newUser: UserProfile = {
            name: formattedName,
            email: savedEmail,
            phone: '+91 ',
            address: '',
            handle: `@${savedEmail.split('@')[0]}`,
            initials: formattedName.charAt(0).toUpperCase(),
            dob: '',
            aadhaarNumber: '',
            panNumber: '',
            occupation: '',
            altPhone: '+91 ',
            emergencyContact: ''
          };
          setUser(newUser);
          localStorage.setItem('amman_user_profile', JSON.stringify(newUser));
        } else {
          // Default fresh profile
          localStorage.setItem('amman_user_profile', JSON.stringify(DEFAULT_JAI_USER));
        }
      }
    } catch (e) {
      console.error('Error loading user profile from localStorage:', e);
    }
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const nameToUse = updates.name || prev.name;
      const initials = nameToUse.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'J';
      const updated: UserProfile = {
        ...prev,
        ...updates,
        phone: updates.phone !== undefined ? (updates.phone || '+91 ') : prev.phone,
        altPhone: updates.altPhone !== undefined ? (updates.altPhone || '+91 ') : prev.altPhone,
        initials,
        handle: updates.email ? `@${updates.email.split('@')[0]}` : prev.handle
      };
      try {
        localStorage.setItem('amman_user_profile', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving user profile:', e);
      }
      return updated;
    });
  };

  const loginUser = (email: string, name?: string) => {
    const derivedName = name || email.split('@')[0].replace('.', ' ');
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    const newUser: UserProfile = {
      name: formattedName,
      email,
      phone: '+91 ',
      address: '',
      handle: `@${email.split('@')[0]}`,
      initials: formattedName.charAt(0).toUpperCase(),
      dob: '',
      aadhaarNumber: '',
      panNumber: '',
      occupation: '',
      altPhone: '+91 ',
      emergencyContact: ''
    };
    setUser(newUser);
    try {
      localStorage.setItem('amman_user_profile', JSON.stringify(newUser));
      localStorage.setItem('user_email', email);
    } catch (e) {
      console.error('Error saving user login profile:', e);
    }
  };

  const logoutUser = () => {
    try {
      localStorage.removeItem('amman_user_profile');
      localStorage.removeItem('user_email');
    } catch (e) {
      console.error('Error clearing user profile:', e);
    }
    setUser(DEFAULT_JAI_USER);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

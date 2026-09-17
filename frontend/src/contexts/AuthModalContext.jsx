import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [redirectUrl, setRedirectUrl] = useState(null);

  const openModal = (initialMode = 'login', redirect = null) => {
    setMode(initialMode);
    setRedirectUrl(redirect);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Reset after a short delay for smooth closing animation
    setTimeout(() => {
      setMode('login');
      setRedirectUrl(null);
    }, 300);
  };

  // Listen for custom events triggered from non-React environments like api.js
  useEffect(() => {
    const handleOpenAuth = (e) => {
      const mode = e.detail?.mode || 'login';
      const redirect = e.detail?.redirect || null;
      openModal(mode, redirect);
    };

    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, setMode, redirectUrl, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
};

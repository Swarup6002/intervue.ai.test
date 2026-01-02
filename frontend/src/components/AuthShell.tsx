import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { Toaster } from 'sonner';

// Helper to handle hard redirects to the static Home page
const RedirectToHome = () => {
  useEffect(() => {
    window.location.href = '/';
  }, []);
  return null;
};

export default function AuthShell() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Redirects for external static pages */}
        <Route path="/" element={<RedirectToHome />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
    </AuthProvider>
  );
}
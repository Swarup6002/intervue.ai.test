import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import InterviewPage from './pages/InterviewPage';
import { Toaster } from 'sonner';

export default function AppShell() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/interview">
        <Routes>
          <Route path="/" element={<InterviewPage />} />
          {/* Catch-all route for client-side routing */}
          <Route path="*" element={<InterviewPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}
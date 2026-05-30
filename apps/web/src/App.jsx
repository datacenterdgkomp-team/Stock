
import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { LogoProvider } from '@/contexts/LogoContext.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';

import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import KasirPage from '@/pages/KasirPage.jsx';
import BarangPage from '@/pages/BarangPage.jsx';
import { Toaster } from '@/components/ui/sonner';

// Simplified Layout Wrapper for authenticated routes
const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-background w-full flex">
      {/* Sidebar exists alongside the main layout */}
      <Sidebar isOpen={true} />
      
      {/* Responsive left margin matching sidebar width on desktop */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300 ease-in-out md:ml-[220px]">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background relative pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LogoProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/barang" element={<BarangPage />} />
                <Route path="/kasir" element={<KasirPage />} />
                {/* Additional authenticated POS routes naturally go here */}
              </Route>
            </Route>
            
            {/* Catch-all 404 Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </Router>
      </LogoProvider>
    </AuthProvider>
  );
}

export default App;

// apps/web/src/main.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { trpc, trpcClient } from './lib/trpc';

import './index.css';

import App from './App';
// import { SocketProvider } from './providers/SocketProvider'; // Removed unused provider
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';

const queryClient = new QueryClient();

const TrpcProvider = (trpc as any).Provider;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <TrpcProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <App />
                </RequireAuth>
              }
            />
          </Routes>
          <Toaster position="bottom-right" closeButton richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </TrpcProvider>
  </React.StrictMode>
);

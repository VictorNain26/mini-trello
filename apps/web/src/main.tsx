// apps/web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './lib/trpc';

import './index.css';

import { SocketProvider } from './providers/SocketProvider';
import RequireAuth from './components/RequireAuth';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';

const queryClient = new QueryClient();

const TrpcProvider = (trpc as any).Provider;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SocketProvider>
      <TrpcProvider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="*"
                element={
                  <RequireAuth>
                    <App />
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </TrpcProvider>
    </SocketProvider>
  </React.StrictMode>,
);

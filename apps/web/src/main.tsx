import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './lib/trpc';

import { SocketProvider } from '@/providers/SocketProvider';
import RequireAuth from '@/components/RequireAuth';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SocketProvider>
      <trpc.Provider client={trpcClient} queryClient={qc}>
        <QueryClientProvider client={qc}>
          <BrowserRouter>
            <Routes>
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/*" element={
                <RequireAuth>
                  <App />
                </RequireAuth>
              }/>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </trpc.Provider>
    </SocketProvider>
  </React.StrictMode>,
);

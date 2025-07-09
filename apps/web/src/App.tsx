import { Navigate, Route, Routes } from 'react-router-dom';
import Board from './pages/Board';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/board/:id" element={<Board />} />
    </Routes>
  );
}

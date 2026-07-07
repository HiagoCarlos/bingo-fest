// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';

import { Home } from './pages/Home';
import { PlayerBoard } from './pages/PlayerBoard';
import { HostPanel } from './pages/HostPanel';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    // O Provider garante que todas as rotas tenham acesso ao WebSocket
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<PlayerBoard />} />
          <Route path="/host/:roomId" element={<HostPanel />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/host/:roomId" element={<HostPanel />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
const isProduction = import.meta.env.PROD;
interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Conecta ao nosso backend Node.js
    const socketUrl = isProduction ? window.location.origin : 'http://localhost:3333';
    const socketInstance = io(socketUrl);
    
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor de Bingo!');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('esconectado do servidor.');
      setIsConnected(false);
    });

    
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook customizado para facilitar o uso nos componentes
export const useSocket = () => useContext(SocketContext);

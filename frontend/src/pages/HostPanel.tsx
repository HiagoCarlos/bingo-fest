// frontend/src/pages/HostPanel.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../services/api';

export function HostPanel() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  
  const [roomData, setRoomData] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null); 
  
  const [lastBall, setLastBall] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentMsg, setCurrentMsg] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const token = localStorage.getItem('@HabboBingo:adminToken');
    if (!token) { navigate('/admin'); return; }

    const fetchRoom = async () => {
      try {
        const response = await api.get(`/rooms/${roomId}`);
        setRoomData(response.data);
        setPlayers(response.data.players);
        
        if (response.data.status !== 'WAITING') {
          setGameStarted(true);
          setIsLocked(true);
        }
        if (response.data.status === 'FINISHED') setWinnerName("JÁ ENCERRADO");
      } catch (error) {
        navigate('/admin/dashboard');
      }
    };
    fetchRoom();

    if (socket && roomId) {
      socket.emit('join_room', { roomId, habboNick: 'HOST_ADMIN' });

      socket.on('game_started', () => {
        setGameStarted(true);
        setIsLocked(true);
      });

      socket.on('room_lock_state', (locked: boolean) => setIsLocked(locked));
      socket.on('new_ball', (ball: string) => { setLastBall(ball); setHistory((prev) => [ball, ...prev]); });
      
      socket.on('receive_message', ({ habboNick, message }) => {
        setChatMessages((prev) => [...prev, { sender: habboNick, text: message }]);
      });

      socket.on('player_joined', (nick: string) => {
        setChatMessages((prev) => [...prev, { sender: 'Sistema', text: `🪗 ${nick} entrou`, isSystem: true }]);
        if(nick !== 'HOST_ADMIN') {
          setPlayers((prev) => {
            if (prev.some(p => p.habboNick === nick)) return prev;
            return [...prev, { id: Math.random().toString(), habboNick: nick }];
          });
        }
      });

      socket.on('player_kicked', (nick: string) => {
        setChatMessages((prev) => [...prev, { sender: 'Sistema', text: `👢 ${nick} foi expulso`, isSystem: true }]);
        setPlayers((prev) => prev.filter(p => p.habboNick !== nick));
      });

      socket.on('bingo_winner', (winner: string) => {
        setWinnerName(winner);
        setIsLocked(true); 
      });

      // NOVO: Exibe alerta caso você tente sortear sem iniciar
      socket.on('error', (msg: string) => {
        alert(`❌ ERRO NO SERVIDOR: ${msg}`);
      });

      return () => {
        socket.off('game_started'); socket.off('room_lock_state'); socket.off('new_ball'); 
        socket.off('receive_message'); socket.off('player_joined'); socket.off('player_kicked'); 
        socket.off('bingo_winner'); socket.off('error');
      };
    }
  }, [socket, roomId, navigate]);

  const handleStartGame = () => {
    socket?.emit('start_game', roomId);
  };

  const handleToggleLock = () => {
    const newState = !isLocked;
    socket?.emit('toggle_lock', { roomId, isLocked: newState });
    setIsLocked(newState);
  };

  const handleDrawBall = () => {
    if (!winnerName) socket?.emit('draw_ball', roomId);
  };
  
  const handleEndEvent = async () => {
    if(window.confirm('Tem certeza que deseja ENCERRAR O EVENTO? Todos os jogadores serão chutados para o login!')) {
      socket?.emit('delete_room', roomId);
      try { await api.delete(`/rooms/${roomId}`); } catch(e) {}
      navigate('/admin/dashboard');
    }
  };

  const handleKickPlayer = (nick: string) => {
    if(window.confirm(`Expulsar ${nick} da sala?`)) {
      socket?.emit('kick_player', { roomId, habboNick: nick });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMsg.trim() || !socket) return;
    socket.emit('send_message', { roomId, habboNick: 'HOST', message: currentMsg });
    setCurrentMsg('');
  };

  return (
    <div className="min-h-screen bg-xadrez flex items-center justify-center p-2 md:p-6">
      
      <div className="w-full max-w-7xl wood-panel flex flex-col rounded-xl shadow-2xl overflow-hidden">
        
        <div className="wood-dark h-10 flex items-center px-4 justify-between border-b-4 border-[#3e1b04]">
          <span className="font-pixel text-[10px] text-yellow-400 tracking-widest">MESA DO DJ (HOST) - SALA: {roomData?.code}</span>
          <button onClick={() => navigate('/admin/dashboard')} className="font-pixel text-[8px] text-white bg-red-700 border-2 border-red-900 px-3 py-1">VOLTAR AO PAINEL</button>
        </div>

        <div className="flex flex-col lg:flex-row p-4 gap-4 bg-[#fdf6e3] h-auto lg:h-[600px]">
          
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            
            <div className="flex gap-2">
              <button 
                onClick={handleToggleLock} 
                className={`flex-1 border-b-4 border-r-4 active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 text-white font-pixel text-[10px] py-4 uppercase shadow-md transition-all ${isLocked ? 'bg-red-600 border-red-800' : 'bg-green-600 border-green-800'}`}
              >
                {isLocked ? '🔒 SALA FECHADA (CLIQUE PARA ABRIR)' : '🔓 SALA ABERTA (CLIQUE PARA FECHAR)'}
              </button>
              
              {winnerName && (
                <button 
                  onClick={handleEndEvent} 
                  className="flex-1 bg-red-900 border-b-4 border-r-4 border-black active:translate-y-1 active:translate-x-1 text-white font-pixel text-[10px] py-4 uppercase shadow-md animate-pulse"
                >
                  🧨 ENCERRAR EVENTO E EXPULSAR TODOS
                </button>
              )}
            </div>
            
            {!gameStarted ? (
              <button 
                onClick={handleStartGame}
                className="bg-green-600 border-b-[6px] border-r-[6px] border-green-900 active:translate-y-1 active:translate-x-1 text-white font-pixel text-lg p-6 shadow-lg shrink-0 transition-all hover:bg-green-500 animate-pulse"
              >
                ▶ INICIAR EVENTO E GERAR URNA
              </button>
            ) : (
              <button 
                onClick={handleDrawBall} 
                disabled={!!winnerName}
                className={`border-b-[6px] border-r-[6px] active:translate-y-1 active:translate-x-1 text-white font-pixel text-lg p-6 shadow-lg shrink-0 transition-all ${winnerName ? 'bg-gray-500 border-gray-700 opacity-50 cursor-not-allowed' : 'bg-blue-600 border-blue-900 hover:bg-blue-500'}`}
              >
                {winnerName ? `🎉 VENCEDOR: ${winnerName} 🎉` : 'SORTEAR PEDRA'}
              </button>
            )}
            
            <div className="bg-white border-4 border-[#c98a4b] p-4 text-center flex-1 flex flex-col justify-center items-center shadow-inner min-h-[150px] rounded">
              <span className="font-pixel text-[10px] text-gray-500 mb-4">PEDRA ATUAL</span>
              <span className="font-pixel text-5xl md:text-7xl text-treinadores-darkRed drop-shadow-md">
                {lastBall || '--'}
              </span>
            </div>

            <div className="bg-white border-4 border-[#c98a4b] p-3 h-24 overflow-x-auto flex items-center gap-2 flex-nowrap shrink-0 rounded shadow-inner">
              <span className="font-pixel text-[8px] text-gray-400 shrink-0">HISTÓRICO:</span>
              {history.map((ball, idx) => (
                <div key={idx} className="bg-gray-100 border-2 border-gray-300 p-2 min-w-[3rem] shrink-0 text-center font-pixel text-xs text-black rounded">{ball}</div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[300px] bg-white border-4 border-[#c98a4b] flex flex-col shadow-lg shrink-0 h-[300px] lg:h-full rounded overflow-hidden">
            <div className="bg-[#c98a4b] p-2 border-b-4 border-[#5c2e0b] flex justify-between shrink-0">
              <span className="font-pixel text-[8px] text-white">PLAYERS ONLINE</span>
              <span className="font-pixel text-[8px] text-yellow-300">{players.length}</span>
            </div>
            <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-2 bg-[#fdf6e3]">
              {players.length === 0 && <span className="font-pixel text-[8px] text-gray-500 text-center mt-4">A barraca tá vazia.</span>}
              {players.map(p => (
                <div key={p.id} className="bg-white border-2 border-gray-300 p-2 flex justify-between items-center shrink-0 rounded">
                  <span className="font-pixel text-[8px] text-black truncate max-w-[120px]">{p.habboNick}</span>
                  <button onClick={() => handleKickPlayer(p.habboNick)} className="bg-red-600 border-b-2 border-r-2 border-red-900 active:translate-y-1 active:translate-x-1 text-white font-pixel text-[6px] px-2 py-1">EXPULSAR</button>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[300px] bg-white border-4 border-[#c98a4b] flex flex-col shadow-lg shrink-0 h-[300px] lg:h-full rounded overflow-hidden">
            <div className="bg-purple-700 p-2 border-b-4 border-purple-900 shrink-0">
              <span className="font-pixel text-[8px] text-white">CHAT DO HOST</span>
            </div>
            
            <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-2 bg-[#fdf6e3]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`font-pixel text-[8px] break-words ${msg.isSystem ? 'text-orange-600 text-center italic' : 'text-gray-800'}`}>
                  {!msg.isSystem && (
                     <span className={msg.sender === 'HOST' ? 'text-purple-700 font-bold mr-1' : 'text-treinadores-darkRed mr-1'}>
                       {msg.sender === 'HOST' ? '👑 DIRETORIA' : msg.sender}:
                     </span>
                  )}
                  <span className={msg.sender === 'HOST' ? 'text-purple-900 font-bold' : ''}>{msg.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2 bg-[#e6d5b8] border-t-4 border-[#c98a4b] flex gap-2 shrink-0">
              <input 
                type="text" value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)}
                placeholder="Aviso do Admin..." 
                className="w-full bg-white border-2 border-[#c98a4b] text-purple-900 font-bold font-pixel text-[8px] p-2 focus:outline-none focus:border-purple-600"
              />
              <button type="submit" className="bg-purple-700 border-b-2 border-r-2 border-purple-900 text-white font-pixel text-[8px] px-2 active:translate-y-1 active:translate-x-1">
                AVISAR
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
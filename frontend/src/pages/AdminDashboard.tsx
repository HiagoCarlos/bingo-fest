// frontend/src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import logoGame from '../assets/Logo_Game.png';

interface RoomData { id: string; code: string; status: string; players: any[]; }

export function AdminDashboard() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [newRoomCode, setNewRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { socket } = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('@HabboBingo:adminToken');
    if (!token) { navigate('/admin'); return; }
    loadRooms();
  }, [navigate]);

  const loadRooms = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setRooms(response.data);
    } catch (err) {}
  };

  const handleCreateRoom = async () => {
    if (!newRoomCode) return;
    setLoading(true);
    try {
      await api.post('/rooms', { code: newRoomCode });
      setNewRoomCode('');
      loadRooms();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar a sala.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (window.confirm('ATENÇÃO: Tem certeza que deseja apagar esta barraca e expulsar todos?')) {
      try {
        if (socket) socket.emit('delete_room', id);
        await api.delete(`/rooms/${id}`);
        loadRooms();
      } catch (err: any) {
        alert('Erro ao excluir a sala.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@HabboBingo:adminToken');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-xadrez flex items-center justify-center p-4">
      <div className="w-full max-w-5xl wood-panel flex flex-col relative rounded-xl shadow-2xl overflow-hidden">
        
        <div className="wood-dark h-10 flex items-center px-4 justify-between border-b-4 border-[#3e1b04]">
          <span className="font-pixel text-[12px] text-yellow-400 tracking-widest text-shadow-sm">DIRETORIA DO ARRAIÁ (ADMIN)</span>
          <button onClick={handleLogout} className="bg-red-700 border-2 border-red-900 px-3 py-1 font-pixel text-[8px] text-white hover:bg-red-600 active:translate-y-1">DESCONECTAR</button>
        </div>

        <div className="flex flex-col md:flex-row p-6 gap-6 bg-[#fdf6e3]">
          
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="bg-white border-4 border-[#c98a4b] p-6 shadow-md flex flex-col items-center rounded-lg">
              <img src={logoGame} alt="Logo" className="w-20 pixelated mb-4 drop-shadow-md" onError={(e) => e.currentTarget.style.display = 'none'} />
              <h2 className="title-ribbon ribbon-red font-pixel text-xs text-center w-full mb-6">CRIAR BARRACA</h2>
              
              <input 
                type="text" value={newRoomCode} onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO (EX: FESTA10)"
                className="w-full p-3 border-4 border-[#5c2e0b] focus:outline-none focus:border-red-600 font-pixel text-[10px] bg-gray-50 uppercase mb-4"
              />
              <button 
                onClick={handleCreateRoom} disabled={loading || !newRoomCode}
                className="w-full bg-green-600 border-b-4 border-r-4 border-green-900 active:translate-y-1 active:translate-x-1 text-white font-pixel text-[10px] px-4 py-3 disabled:opacity-50 uppercase"
              >
                {loading ? 'CONSTRUINDO...' : 'CRIAR SALA'}
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 bg-white border-4 border-[#c98a4b] p-4 shadow-md min-h-[300px] rounded-lg">
             <h2 className="title-ribbon ribbon-blue font-pixel text-xs flex justify-between w-full mb-6">
               <span>GERENCIAR BARRACAS</span>
               <span className="text-yellow-300 ml-4">TOTAL: {rooms.length}</span>
             </h2>
             
             <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
               {rooms.map(room => (
                 <div key={room.id} className="bg-gray-100 border-2 border-gray-300 p-3 flex justify-between items-center rounded">
                   <div>
                     <h3 className="font-pixel text-treinadores-darkRed text-xs mb-1">SALA: {room.code}</h3>
                     <p className="font-pixel text-[#5c2e0b] text-[8px]">PLAYERS: {room.players.length} | STATUS: {room.status === 'WAITING' ? 'ABERTA' : 'FECHADA'}</p>
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => navigate(`/host/${room.id}`)}
                       className="bg-blue-600 border-b-2 border-r-2 border-blue-900 active:translate-y-1 active:translate-x-1 text-white font-pixel text-[8px] px-3 py-2"
                     >
                       ENTRAR (HOST)
                     </button>
                     <button 
                       onClick={() => handleDeleteRoom(room.id)}
                       className="bg-red-700 border-b-2 border-r-2 border-red-900 active:translate-y-1 active:translate-x-1 text-white font-pixel text-[8px] px-3 py-2"
                     >
                       APAGAR
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
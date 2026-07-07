// frontend/src/pages/PlayerBoard.tsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useBingoAudio } from '../hooks/useBingoAudio';
import { useRetroAudio } from '../hooks/useRetroAudio';
import confetti from 'canvas-confetti';

import logoGame from '../assets/Logo_Game.png';
import arraiaMusic from '../assets/arraia.mp3';

interface BingoCard { B: number[]; I: number[]; N: (number | string)[]; G: number[]; O: number[]; }
interface ChatMessage { sender: string; text: string; isSystem?: boolean; }

export function PlayerBoard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { announceBall } = useBingoAudio();
  const { playClick, playError, playGoal } = useRetroAudio();

  const player = location.state?.player;
  const card: BingoCard = player?.card;
  const columns = ['B', 'I', 'N', 'G', 'O'] as const;

  const [drawnBalls, setDrawnBalls] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMsg, setCurrentMsg] = useState('');
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<string | null>(null);
  
  const [showRules, setShowRules] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!player) { navigate('/'); return; }

    if (socket && player.roomId) {
      socket.emit('join_room', { roomId: player.roomId, habboNick: player.habboNick });

      socket.on('new_ball', (ball: string) => {
        setDrawnBalls((prev) => [ball, ...prev]);
        announceBall(ball);
      });

      socket.on('receive_message', ({ habboNick, message }) => {
        setChatMessages((prev) => [...prev, { sender: habboNick, text: message }]);
      });

      socket.on('player_joined', (nick: string) => {
        setChatMessages((prev) => [...prev, { sender: 'Sistema', text: `🪗 ${nick} chegou no arraiá`, isSystem: true }]);
      });

      socket.on('player_kicked', (nick: string) => {
        if (nick === player.habboNick) {
          playError();
          setCustomAlert('VOCÊ FOI CONVIDADO A SE RETIRAR DA FESTA (EXPULSO).');
        } else {
          setChatMessages((prev) => [...prev, { sender: 'Sistema', text: `[-] ${nick} foi enxotado`, isSystem: true }]);
        }
      });

      socket.on('room_closed', () => {
        playError();
        setCustomAlert('A FESTA ACABOU! O BINGO FOI ENCERRADO.');
      });

      socket.on('bingo_winner', (winner: string) => {
        setWinnerName(winner);
        playGoal();
        confetti({ particleCount: 400, spread: 200, origin: { y: 0.3 }, zIndex: 99999, colors: ['#b91c1c', '#fbbf24', '#16a34a', '#3b82f6'] });
        if (winner === player.habboNick) {
          announceBall("BINGO BINGO BINGO! VOCÊ VENCEU!");
        } else {
          announceBall(`AÊ CUMPADE! ${winner} BATEU O BINGO!`);
        }
      });

      socket.on('bingo_invalid', (_msg: string) => {
        playError();
        setCustomAlert("OLHA A COBRA! É MENTIRA! Sua cartela ainda não bateu.");
      });

      return () => {
        socket.off('new_ball'); socket.off('receive_message'); socket.off('player_joined');
        socket.off('player_kicked'); socket.off('room_closed'); socket.off('bingo_winner');
        socket.off('bingo_invalid');
      };
    }
  }, [player, navigate, socket, announceBall, playError, playGoal]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMsg.trim() || !socket) return;
    playClick();
    socket.emit('send_message', { roomId: player.roomId, habboNick: player.habboNick, message: currentMsg });
    setCurrentMsg('');
  };

  const handleLeave = () => {
    playClick();
    if(window.confirm('Tem certeza que quer ir embora da festa?')) navigate('/');
  };

  const handleBingo = () => {
    playClick();
    if (!socket || !player || winnerName) return;
    socket.emit('claim_bingo', { roomId: player.roomId, playerId: player.id });
  };

  const handleCloseAlert = () => {
    playClick();
    if (customAlert?.includes('EXPULSO') || customAlert?.includes('ENCERRADO')) {
      navigate('/');
    } else {
      setCustomAlert(null);
    }
  };

  const toggleMusic = () => {
    playClick();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = 0.2;
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const isMarked = (col: string, value: number | string) => {
    if (value === 'FREE') return true;
    return drawnBalls.includes(`${col}-${value}`);
  };

  if (!player) return null;

  return (
    <div className="min-h-screen bg-xadrez flex items-start md:items-center justify-center p-2 md:p-6 relative">
      
      <audio ref={audioRef} src={arraiaMusic} loop />

      <div className="lantern" style={{ left: '8%', animationDelay: '1s', animationDuration: '15s' }}>🪔</div>
      <div className="lantern" style={{ left: '85%', animationDelay: '5s', animationDuration: '17s' }}>🎈</div>

      {customAlert && (
        <div className="fixed inset-0 bg-black/60 z-[999999] flex items-center justify-center p-4">
          <div className="wood-panel max-w-sm w-full flex flex-col rounded-lg overflow-hidden animate-pop">
            <div className="wood-dark p-2 text-center border-b-4 border-[#3e1b04]">
              <span className="font-pixel text-[12px] text-yellow-400">⚠️ ATENÇÃO CUMPADE!</span>
            </div>
            <div className="p-6 flex flex-col items-center gap-6 bg-[#fdf6e3]">
              <p className="font-pixel text-black text-[10px] md:text-xs text-center leading-loose">
                {customAlert}
              </p>
              <button onClick={handleCloseAlert} className="bg-red-700 border-b-4 border-r-4 border-red-900 active:translate-y-1 active:translate-x-1 text-white font-pixel text-xs px-6 py-3 uppercase w-full">
                TÁ BAUM (OK)
              </button>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4">
          <div className="wood-panel max-w-2xl w-full max-h-[90vh] flex flex-col rounded-lg overflow-hidden animate-pop">
            <div className="wood-dark p-3 flex items-center justify-between">
              <span className="font-pixel text-[12px] text-yellow-400 text-shadow-sm">MURAL DO ARRAIÁ</span>
              <button onClick={() => { playClick(); setShowRules(false); }} className="text-white font-pixel text-[10px] bg-red-700 border-2 border-red-900 px-3 py-1 hover:bg-red-600 active:translate-y-1">FECHAR</button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-8 items-center bg-[#fdf6e3]">
              <div className="w-full flex flex-col items-center">
                <h2 className="title-ribbon ribbon-green font-pixel text-[10px] md:text-xs">REGRAS DO JOGO</h2>
                <div className="cordel-paper p-5 pt-8 w-full text-left h-full">
                  <ul className="font-pixel text-[10px] md:text-xs text-[#5c2e0b] leading-relaxed space-y-2 list-disc pl-4">
                    <li>Fique de olho na tela! O sistema marca o feijão sozinho.</li>
                    <li>O primeiro cumpade que bater o bingo e clicar no botão verde ganha.</li>
                    <li>Se clicar falso em "Gritar Bingo", passa vergonha na frente de todo mundo.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl wood-panel flex flex-col relative rounded-xl overflow-hidden mt-2 md:mt-0 shadow-2xl z-10">
        
        <div className="absolute top-0 left-0 w-full h-1 flex justify-around pointer-events-none z-50">
          <div className="w-2 h-2 rounded-full fairy-light-1"></div>
          <div className="w-2 h-2 rounded-full fairy-light-2"></div>
          <div className="w-2 h-2 rounded-full fairy-light-1"></div>
          <div className="w-2 h-2 rounded-full fairy-light-2"></div>
          <div className="w-2 h-2 rounded-full fairy-light-1"></div>
          <div className="w-2 h-2 rounded-full fairy-light-2"></div>
        </div>

        {winnerName && (
          <div className="bg-yellow-400 border-b-4 border-yellow-600 p-3 text-center relative z-50">
            <h1 className="font-pixel text-red-900 text-[10px] md:text-sm animate-pulse">
              🎉 BATERAM BINGO! O VENCEDOR FOI: <span className="bg-white px-2 py-1 mx-2 rounded border border-red-900">{winnerName}</span> 🎉
            </h1>
          </div>
        )}

        <div className="flex flex-col md:flex-row bg-[#fdf6e3] p-2 md:p-4 gap-2 md:gap-4">
          
          <div className="flex-1 flex flex-col gap-3 w-full">
            <div className="wood-panel p-2 flex flex-col md:flex-row justify-between items-center rounded-lg gap-2 relative">
              
              <div className="absolute bottom-1 left-20 flex gap-1">
                <span className="ember-particle" style={{ animationDelay: '0s' }}></span>
                <span className="ember-particle" style={{ animationDelay: '0.4s' }}></span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <img src={logoGame} alt="Logo" className="w-8 md:w-10 pixelated drop-shadow-md" />
                <div className="flex flex-col">
                  <h2 className="font-pixel text-white text-[10px] md:text-[12px] uppercase text-shadow-sm">{player.habboNick}</h2>
                  <span className="font-pixel text-[8px] text-yellow-200">TICKET #{player.id.substring(0,5)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto justify-end">
                <button onClick={toggleMusic} className={`border-b-2 border-r-2 border-black active:translate-y-[2px] text-white font-pixel text-[8px] px-2 py-2 flex items-center gap-1 ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}>
                  {isPlaying ? '🔇 MÚSICA' : '🪗 MÚSICA'}
                </button>
                <button onClick={() => { playClick(); setShowRules(true); }} className="bg-blue-600 border-b-2 border-r-2 border-black hover:bg-blue-500 active:translate-y-[2px] text-white font-pixel text-[8px] px-2 py-2">
                  📜 REGRAS
                </button>
                <button onClick={handleLeave} className="bg-red-800 border-b-2 border-r-2 border-black hover:bg-red-700 active:translate-y-[2px] text-white font-pixel text-[8px] px-2 py-2">
                  🚪 SAIR
                </button>
              </div>
            </div>

            <div className="bg-white border-4 border-[#c98a4b] p-2 flex gap-2 overflow-x-auto items-center h-14 md:h-16 rounded shadow-inner">
              <span className="font-pixel text-[8px] md:text-[10px] text-treinadores-darkRed whitespace-nowrap">PEDRAS:</span>
              {drawnBalls.slice(0, 5).map((ball, idx) => (
                <div key={idx} className={`flex items-center justify-center p-1 border-2 rounded-full ${idx === 0 ? 'animate-pop bg-treinadores-red border-white shadow-md' : 'bg-gray-200 border-gray-400'} min-w-[2.5rem] md:min-w-[3rem] h-8 md:h-10`}>
                  <span className={`font-pixel text-[8px] md:text-[10px] ${idx === 0 ? 'text-white' : 'text-gray-700'}`}>{ball}</span>
                </div>
              ))}
              {drawnBalls.length === 0 && <span className="font-pixel text-[8px] text-gray-400">Aguardando o cantador...</span>}
            </div>

            <div className="bg-white p-2 md:p-4 border-4 border-[#c98a4b] rounded-lg shadow-md">
              <div className="grid grid-cols-5 gap-1 md:gap-2 mb-2">
                {columns.map(col => (
                  <div key={col} className="bg-treinadores-red border-b-4 border-r-4 border-treinadores-darkRed py-2 flex items-center justify-center rounded">
                    <span className="font-pixel text-xs md:text-lg text-white drop-shadow-md">{col}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-1 md:gap-2">
                {[0, 1, 2, 3, 4].map(rowIndex => (
                   columns.map(col => {
                     const cellValue = card[col][rowIndex];
                     const marked = isMarked(col, cellValue);
                     return (
                       <div key={`${col}-${rowIndex}`} className={`flex items-center justify-center aspect-square border-2 rounded transition-all duration-75 ${marked ? 'animate-mark' : 'bg-gray-50 border-gray-300'}`}>
                         {cellValue === 'FREE' ? (
                           <img src={logoGame} className={`w-6 md:w-10 pixelated ${marked ? 'opacity-100' : 'opacity-30'}`} alt="Free" />
                         ) : (
                           <span className={`font-pixel text-[10px] md:text-sm ${marked ? 'text-white' : 'text-black'}`}>{cellValue}</span>
                         )}
                       </div>
                     );
                   })
                ))}
              </div>
            </div>

            <button 
              onClick={handleBingo}
              disabled={!!winnerName}
              className={`w-full border-b-4 border-r-4 md:border-b-[6px] md:border-r-[6px] active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 text-white font-pixel text-[12px] md:text-sm py-4 uppercase rounded transition-all shadow-md
                ${winnerName 
                  ? 'bg-gray-500 border-gray-700 opacity-50 cursor-not-allowed' 
                  : 'bg-green-600 border-green-800 hover:bg-green-500 btn-bingo-pulse'}`}
            >
              {winnerName ? 'BINGO ENCERRADO' : 'GRITAR BINGO!'}
            </button>

          </div>

          <div className="w-full md:w-[280px] shrink-0 bg-white border-4 border-[#c98a4b] flex flex-col h-[250px] md:h-auto rounded-lg overflow-hidden">
            <div className="bg-[#c98a4b] p-2 border-b-4 border-[#5c2e0b] text-center">
              <span className="font-pixel text-[10px] text-white text-shadow-sm">CORREIO ELEGANTE</span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 bg-[#fdf6e3]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`font-pixel text-[8px] md:text-[10px] break-words ${msg.isSystem ? 'text-orange-600 text-center italic' : 'text-gray-800'}`}>
                  {!msg.isSystem && (
                    <span className={msg.sender === 'HOST' ? 'text-purple-700 font-bold mr-1 drop-shadow-sm' : 'text-treinadores-darkRed mr-1'}>
                      {msg.sender === 'HOST' ? '👑 DIRETORIA' : msg.sender}:
                    </span>
                  )}
                  <span className={msg.sender === 'HOST' ? 'text-purple-900 font-bold' : ''}>{msg.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2 bg-[#e6d5b8] border-t-4 border-[#c98a4b] flex flex-col gap-2">
              <input 
                type="text" value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)}
                placeholder="Manda um recado..." 
                className="w-full bg-white border-2 border-[#c98a4b] text-black font-pixel text-[8px] md:text-[10px] p-2 focus:outline-none focus:border-treinadores-red" maxLength={80}
              />
              <button type="submit" disabled={!currentMsg.trim()} className="bg-treinadores-red border-b-4 border-r-4 border-treinadores-darkRed hover:bg-red-600 active:translate-y-[2px] active:translate-x-[2px] text-white font-pixel text-[8px] md:text-[10px] px-2 py-2 uppercase w-full">
                ENVIAR MENSAGEM
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
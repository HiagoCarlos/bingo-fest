// frontend/src/pages/Home.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useRetroAudio } from '../hooks/useRetroAudio';

import logoGame from '../assets/Logo_Game.png';
import arraiaMusic from '../assets/arraia.mp3';

export function Home() {
  const [habboNick, setHabboNick] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { playClick } = useRetroAudio();

  const toggleMusic = () => {
    playClick();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = 0.3;
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboNick || !roomCode) return;
    
    playClick();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/players/join', { habboNick, roomCode });
      const player = response.data;
      navigate(`/room/${player.roomId}`, { state: { player } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao tentar entrar no Arraiá.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-xadrez flex flex-col items-center justify-start p-4 md:p-8 relative">
      
      {/* 🎵 ÁUDIO INVISÍVEL */}
      <audio ref={audioRef} src={arraiaMusic} loop />

      {/* 🎈 EFEITOS ESPECIAIS: BALÕES JUNINOS FLUTUANDO NO FUNDO */}
      <div className="lantern" style={{ left: '5%', animationDelay: '0s', animationDuration: '14s' }}>🪔</div>
      <div className="lantern" style={{ left: '25%', animationDelay: '4s', animationDuration: '18s' }}>🎈</div>
      <div className="lantern" style={{ left: '75%', animationDelay: '2s', animationDuration: '16s' }}>🪔</div>
      <div className="lantern" style={{ left: '90%', animationDelay: '7s', animationDuration: '12s' }}>🎈</div>

      {/* Botão de Música */}
      <button 
        onClick={toggleMusic}
        className={`fixed top-4 right-4 md:top-8 md:right-8 border-4 border-[#5c2e0b] font-pixel text-[10px] px-4 py-2 text-white shadow-[4px_4px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:translate-x-1 transition-all z-50 ${isPlaying ? 'bg-red-600' : 'bg-green-600'}`}
      >
        {isPlaying ? '🔇 PARAR SANFONA' : '🪗 TOCAR SANFONA'}
      </button>

      {/* PAINEL PRINCIPAL */}
      <div className="w-full max-w-4xl wood-panel flex flex-col md:flex-row relative rounded-xl overflow-hidden mt-12 md:mt-4 shadow-2xl z-10">
        
        {/* LADO ESQUERDO */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-[#5c2e0b] bg-[#fdf6e3] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgMjAsMjAgNDAsMCIgZmlsbD0iI2I5MWMxYyIvPjwvc3ZnPg==')] opacity-30"></div>

          <img src={logoGame} alt="Logo" className="w-40 pixelated drop-shadow-xl mb-4 relative z-10" />
          
          <h1 className="font-pixel text-treinadores-darkRed text-2xl md:text-3xl text-center mb-2 drop-shadow-sm">
            ARRAIÁ DOS<br/><span className="text-treinadores-red">TREINADORES</span>
          </h1>
          <p className="font-pixel text-[10px] text-gray-600 mb-8 text-center">Puxa a cadeira e pega sua cartela!</p>

         
        </div>

        {/* LADO DIREITO */}
        <div className="w-full md:w-[400px] p-8 flex flex-col justify-center relative bg-[#c98a4b]">
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="bg-[#8b4513] border-4 border-[#3e1b04] p-2 text-center mb-4">
               <span className="font-pixel text-white text-[10px] md:text-xs">ACESSO A BARRACA</span>
            </div>

            {error && (
              <div className="bg-red-200 border-2 border-red-500 text-red-900 p-2 text-[10px] font-pixel text-center uppercase">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-pixel text-white text-shadow-sm text-[10px] uppercase">Seu Nick Habbo:</label>
              <input 
                type="text" value={habboNick} onChange={(e) => setHabboNick(e.target.value)}
                placeholder="Ex: hiagocarlos"
                className="w-full bg-[#fdf6e3] border-4 border-[#5c2e0b] p-3 focus:outline-none focus:border-treinadores-red font-pixel text-xs text-black" maxLength={20} disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-pixel text-white text-shadow-sm text-[10px] uppercase">Código da Barraca (Sala):</label>
              <input 
                type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex: FESTA10"
                className="w-full bg-[#fdf6e3] border-4 border-[#5c2e0b] p-3 focus:outline-none focus:border-treinadores-red font-pixel text-xs text-black uppercase" disabled={loading}
              />
            </div>

            <button 
              type="submit" disabled={loading || !habboNick || !roomCode}
              className="mt-4 bg-green-600 border-b-4 border-r-4 border-green-900 hover:bg-green-500 active:border-0 active:translate-y-1 active:translate-x-1 text-white font-pixel text-sm px-4 py-4 disabled:opacity-50 transition-all uppercase shadow-lg"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR NO BINGO'}
            </button>
          </form>
        </div>

      </div>

      {/* MURAL DE REGRAS ABAIXO */}
      <div className="w-full max-w-4xl wood-panel mt-12 p-6 md:p-10 bg-[#fdf6e3] rounded-xl shadow-2xl flex flex-col z-10">
        <h2 className="font-pixel text-treinadores-darkRed text-xl md:text-2xl text-center drop-shadow-sm border-b-4 border-[#c98a4b] pb-6 mb-8">
          MURAL DE INFORMAÇOES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          <div className="w-full flex flex-col items-center">
            <h2 className="title-ribbon ribbon-red font-pixel text-[10px] md:text-xs">COMO IRÁ FUNCIONAR</h2>
            <div className="cordel-paper p-5 pt-8 w-full text-center h-full">
              <p className="font-pixel text-[10px] text-[#5c2e0b] leading-relaxed">
                O cantador vai puxar as pedras e o nosso sistema tecnológico marca o feijão na sua cartela sozinho! Preste atenção na tela, porque quando fechar a linha, coluna ou a cartela cheia, você precisa agir rápido!
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <h2 className="title-ribbon ribbon-green font-pixel text-[10px] md:text-xs">REGRAS DO JOGO</h2>
            <div className="cordel-paper p-5 pt-8 w-full text-left h-full">
              <ul className="font-pixel text-[10px] text-[#5c2e0b] leading-relaxed space-y-2 list-disc pl-4">
                <li>É estritamente <b>proibido</b> o uso de fakes.</li>
                <li>O primeiro cumpade que bater o bingo e clicar no botão verde leva!</li>
                <li>Se clicar no botão "Gritar Bingo" com a cartela errada, o sistema vai te dar um aviso e você vai passar vergonha.</li>
              </ul>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <h2 className="title-ribbon ribbon-blue font-pixel text-[10px] md:text-xs">PREMIAÇÃO</h2>
            <div className="cordel-paper p-5 pt-8 w-full text-center h-full">
              <p className="font-pixel text-[10px] text-[#5c2e0b] leading-relaxed">
                A cada rodada vencida, o jogador garante um HC do Arraiá da Companhia Treinadores.  
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <h2 className="title-ribbon ribbon-orange font-pixel text-[10px] md:text-xs">DETALHES</h2>
            <div className="cordel-paper p-5 pt-8 w-full text-center h-full">
              <p className="font-pixel text-[10px] text-[#5c2e0b] leading-relaxed">
                Neste Arraiá, a sorte está lançada!<br/><br/>
                <b>DÚVIDAS?</b> Pergunte ao Host responsável pela sala. Boa festança procês!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ASSINATURA */}
      <div className="mt-12 mb-4 text-center z-10">
        <span className="font-pixel text-[10px] md:text-xs text-[#5c2e0b] opacity-80 drop-shadow-sm">
          DESENVOLVIDO POR hiagocarlos &copy; 2024 - COMPANHIA TREINADORES
        </span>
      </div>

    </div>
  );
}
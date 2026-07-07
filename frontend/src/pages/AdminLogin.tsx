// src/pages/AdminLogin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/login', { password });
      
      // Salva o token simples no navegador para manter o admin logado
      localStorage.setItem('@HabboBingo:adminToken', response.data.token);
      
      // Vai para o painel de criar salas
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Senha incorreta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-gray-800 p-8 rounded shadow-2xl border-4 border-gray-600 w-full max-w-sm relative">
        <div className="absolute top-0 left-0 w-full h-6 bg-gray-700 border-b-2 border-gray-600 flex items-center px-2">
          <span className="font-pixel text-[10px] text-white">Acesso Restrito</span>
        </div>

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-200 border-2 border-red-500 text-red-700 p-2 text-xs font-pixel text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block font-pixel text-white text-xs mb-2">Senha do Host:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border-2 border-gray-500 focus:outline-none focus:border-red-500 font-pixel text-xs text-black bg-white"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !password}
            className="bg-red-600 border-b-4 border-r-4 border-red-900 active:border-0 active:translate-y-1 active:translate-x-1 text-white font-pixel text-xs px-4 py-2 mt-2 disabled:opacity-50"
          >
            {loading ? 'VALIDANDO...' : 'ACESSAR PAINEL'}
          </button>
        </form>
      </div>
    </div>
  );
}
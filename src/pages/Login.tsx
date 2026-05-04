import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado, lo mandamos al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let loginUser = email.trim();
    
    // Auto-completar @jorgethelord.com si no lo pone
    if (!loginUser.includes('@')) {
      loginUser = `${loginUser}@jorgethelord.com`;
    }

    try {
      const response = await fetch('https://jorgethelord.com/api/noti/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginUser, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Autenticación fallida');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="w-full max-w-md">
        
        {/* Logo / Encabezado */}
        <div className="text-center mb-8">
          <div className="bg-[#11141D] w-16 h-16 rounded-2xl border border-gray-800 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <LogIn className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dendo</h1>
          <p className="text-gray-400">Inicia sesión para acceder al panel</p>
        </div>

        {/* Formulario */}
        <div className="bg-[#11141D] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Efceto de brillo de fondo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/10 blur-[80px] pointer-events-none" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl relative z-10">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 bg-[#0A0D14] border border-gray-800 rounded-xl py-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 bg-[#0A0D14] border border-gray-800 rounded-xl py-3.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-8 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Entrar al Panel'
              )}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-600 text-sm">
            Portal Privado de Administración
          </p>
          <p className="text-gray-700 text-xs">
            © {new Date().getFullYear()} Dendo
          </p>
        </div>
      </div>
    </div>
  );
}

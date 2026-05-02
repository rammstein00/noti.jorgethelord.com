import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../auth/AuthContext';
import { EyeOff } from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { impersonatedUser, clearImpersonation } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {impersonatedUser && (
        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-sm font-semibold flex justify-center items-center gap-4 z-50 shrink-0">
          <span>🕵️ Estás viendo el panel como el empleado: <span className="underline">{impersonatedUser.name}</span> ({impersonatedUser.email})</span>
          <button 
            onClick={clearImpersonation}
            className="flex items-center gap-1 bg-white hover:bg-yellow-50 px-3 py-1 rounded text-xs transition-colors shadow-sm"
          >
            <EyeOff className="w-4 h-4" />
            Salir
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

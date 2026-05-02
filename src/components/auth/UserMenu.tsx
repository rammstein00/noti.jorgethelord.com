import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 pr-3 rounded-full border border-gray-800 bg-[#11141D] hover:bg-gray-800 transition-colors"
      >
        <img 
          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`} 
          alt={user.name} 
          className="w-8 h-8 rounded-full"
        />
        <div className="hidden md:flex flex-col items-start px-1">
          <span className="text-sm font-medium text-white leading-tight max-w-[100px] truncate">{user.name}</span>
          <span className="text-xs text-gray-500 leading-tight">Admin</span>
        </div>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-800 bg-[#11141D] shadow-2xl overflow-hidden py-1 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-800 mb-1">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            
            <Link 
              to="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <UserIcon size={16} />
              <span>Mi Perfil</span>
            </Link>
            
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

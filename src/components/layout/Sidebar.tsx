import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Link as LinkIcon,
  TrendingUp,
  Lightbulb,
  CreditCard,
  BarChart2,
  Trophy,
  Users,
  Video,
  Facebook,
  User,
  Info,
  FileText,
  HeadphonesIcon,
  UserCog,
  Eye,
  Wallet,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../auth/AuthContext';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const mainNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Enlaces', href: '/links', icon: LinkIcon },
  { name: 'Trending Links', href: '/trending', icon: TrendingUp },
  { name: 'Sugerencias Enlaces', href: '/suggestions', icon: Lightbulb },
  { name: 'Facturación', href: '/billing', icon: CreditCard },
  { name: 'Ranking y Premios', href: '/ranking', icon: Trophy },
  { name: 'Referidos', href: '/referrals', icon: Users },
  { name: 'Recursos y Videos', href: '/resources', icon: Video },
  { name: 'Grupos de Facebook', href: '/facebook', icon: Facebook },
  { name: 'Mi Perfil', href: '/profile', icon: User },
];

const secondaryNav = [
  { name: 'Informaciones', href: '/info', icon: Info },
  { name: 'Términos y Condiciones', href: '/terms', icon: FileText },
  { name: 'Soporte', href: '/support', icon: HeadphonesIcon },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }: { isOpen?: boolean, onClose?: () => void }) {
  const location = useLocation();
  const { user } = useAuth();

  const NavItem = ({ item }: { item: any }) => {
    const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
    return (
      <Link
        to={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[#0c5562] text-white border-l-4 border-[#0c5562]'
            : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
        )}
      >
        <item.icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-gray-500')} />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto transition-transform duration-300 z-50",
        "fixed md:relative w-64",
        "inset-y-0 left-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-[#0c5562] tracking-wider">AGENTE</span>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {mainNav.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* Estadísticas Section */}
        <div className="mt-2 mb-1 px-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5" />
            Estadísticas
          </h3>
        </div>
        <NavItem item={{ name: 'Visitas', href: '/statistics', icon: Eye }} />
        <NavItem item={{ name: 'Ganancias', href: '/earnings', icon: Wallet }} />

        {user?.role === 'admin' && (
          <NavItem
            item={{ name: 'Usuarios', href: '/users', icon: UserCog }}
          />
        )}

        <div className="mt-8 mb-4 px-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">NOTICRISP</h3>
        </div>

        {secondaryNav.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#0c5562] text-white rounded text-sm font-medium hover:bg-[#0a4650] transition-colors">
          <Users className="w-4 h-4" />
          Grupo de Whatsapp
        </button>
        <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#0c5562] text-white rounded text-sm font-medium hover:bg-[#0a4650] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.34-.93.5-1.33.49-.44-.01-1.28-.25-1.9-.45-.77-.25-1.38-.38-1.33-.8.03-.22.34-.44.93-.68 3.64-1.58 6.07-2.63 7.28-3.13 3.46-1.44 4.18-1.69 4.65-1.7.1 0 .33.02.47.13.12.09.15.22.16.33.01.06.01.13 0 .22z"/>
          </svg>
          Grupo de Telegram
        </button>
      </div>
      <div className="p-4 text-xs text-gray-400 text-center">
        Copyright © Noticrisp 2017-2026<br/>Todos los derechos reservados.
      </div>
    </aside>
    </>
  );
}

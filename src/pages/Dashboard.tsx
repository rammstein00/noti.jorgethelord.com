import { useState, useEffect } from 'react';
import { mockCountryData } from '../data/mock';
import { Eye, Wallet, Users, BarChart, Info, Loader2, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '../components/auth/AuthContext';

export default function Dashboard() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

  const [stats, setStats] = useState<{ visitas: number; clicks: number; revenue: number; cpm: number } | null>(null);
  const [isLoading, setIsLoading] = useState(isAdmin);
  const [lastUpdate, setLastUpdate] = useState('');
  const [apiError, setApiError] = useState('');

  const fetchStats = async () => {
    if (!isAdmin) return; // Only admin sees AdsKeeper stats
    setIsLoading(true);
    setApiError('');
    try {
      const response = await fetch(`https://jorgethelord.com/api/noti/adskeeper_stats.php?interval=today&token=${token || ''}`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setLastUpdate(new Date().toLocaleString('es-MX', { hour12: false }));
      } else {
        setApiError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setApiError('No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
    const timer = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [token]);

  const displayVisitas = isAdmin && stats ? stats.visitas.toLocaleString() : '0';
  const displayRevenue = isAdmin && stats ? `$${stats.revenue.toFixed(2)}` : '$0.00';
  const displayClicks = isAdmin && stats ? stats.clicks.toLocaleString() : '0';
  const displayCpm = isAdmin && stats ? `$${stats.cpm.toFixed(2)}` : '$0.00';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {isAdmin && (
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {isLoading ? 'Sincronizando con AdsKeeper...' : 
           apiError ? `⚠️ ${apiError} — mostrando datos de referencia` :
           `✅ AdsKeeper en vivo · Última sync: ${lastUpdate}`}
        </span>
        <button 
          onClick={fetchStats} 
          disabled={isLoading}
          className="flex items-center gap-1 text-[#0c5562] hover:text-[#0a4650] transition-colors disabled:opacity-50"
          title="Refrescar estadísticas"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refrescar</span>
        </button>
      </div>
      )}

      {/* Alerts */}
      <div className="space-y-2">
        <div className="bg-red-600 text-white px-4 py-2 rounded-md text-sm flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-white text-red-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">!</span>
            El usuario que detectemos publicando en grupos cubanos se le cancelará su cuenta en la plataforma
          </div>
          <button className="text-white hover:text-red-200">×</button>
        </div>
        <div className="bg-green-600 text-white px-4 py-2 rounded-md text-sm flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-white text-green-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">i</span>
            Si eres nuevo en Dendo puedes pedir ayuda mediante nuestro whatsapp de soporte haciendo click aquí
          </div>
          <button className="text-white hover:text-green-200">×</button>
        </div>
        <div className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-white text-orange-500 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">!</span>
            Necesitamos que verifiques tu usuario de Telegram y tu número de teléfono mediante la plataforma, sino no podrás acceder a algunas funciones como la preaprobación de perfiles en grupos. Puedes hacerlo pinchando Aquí
          </div>
          <button className="text-white hover:text-orange-200">×</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex overflow-hidden">
          <div className="bg-[#0c5562] p-4 flex items-center justify-center w-20 shrink-0">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <div className="p-4 flex-1">
            <div className="text-3xl font-light text-[#0c5562]">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin mt-1" /> : displayVisitas}
            </div>
            <div className="text-sm text-gray-500 font-medium">Visitas</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex overflow-hidden">
          <div className="bg-red-500 p-4 flex items-center justify-center w-20 shrink-0">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div className="p-4 flex-1">
            <div className="text-3xl font-light text-red-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin mt-1" /> : displayRevenue}
            </div>
            <div className="text-sm text-gray-500 font-medium">Ganancias Hoy</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex overflow-hidden">
          <div className="bg-purple-500 p-4 flex items-center justify-center w-20 shrink-0">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="p-4 flex-1">
            <div className="text-3xl font-light text-purple-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin mt-1" /> : displayClicks}
            </div>
            <div className="text-sm text-gray-500 font-medium">Clics Hoy</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex overflow-hidden">
          <div className="bg-green-500 p-4 flex items-center justify-center w-20 shrink-0">
            <BarChart className="w-8 h-8 text-white" />
          </div>
          <div className="p-4 flex-1">
            <div className="text-3xl font-light text-green-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin mt-1" /> : displayCpm}
            </div>
            <div className="text-sm text-gray-500 font-medium">CPM</div>
          </div>
        </div>
      </div>

      {/* Facebook Group Banner */}
      <div className="flex justify-center">
        <button className="bg-[#3b5998] text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#2d4373] transition-colors">
          <Info className="w-4 h-4" />
          REVISA AQUÍ NUESTROS GRUPOS DE FACEBOOK PARA PUBLICAR TUS ENLACES
        </button>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-red-500 mb-6 uppercase tracking-wide">VISITAS POR PAISES</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Placeholder */}
          <div className="relative h-[300px] bg-blue-50/30 rounded-lg border border-blue-100 flex items-center justify-center overflow-hidden">
             {/* Simple SVG Map representation */}
             <svg viewBox="0 0 800 400" className="w-full h-full opacity-50">
                <path d="M150,100 Q200,50 300,80 T450,120 T600,80 T750,150" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
                <path d="M100,200 Q250,150 400,250 T700,200" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
                <circle cx="200" cy="150" r="40" fill="#3b82f6" opacity="0.6"/>
                <circle cx="220" cy="180" r="20" fill="#1d4ed8" opacity="0.8"/>
                <circle cx="180" cy="120" r="15" fill="#60a5fa" opacity="0.4"/>
                <text x="400" y="200" textAnchor="middle" fill="#94a3b8" className="text-sm">Mapa Interactivo (Mock)</text>
             </svg>
             <div className="absolute top-4 left-4 flex flex-col bg-white border border-gray-200 rounded shadow-sm">
                <button className="px-2 py-1 border-b border-gray-200 hover:bg-gray-50">+</button>
                <button className="px-2 py-1 hover:bg-gray-50">-</button>
             </div>
          </div>

          {/* Pie Chart */}
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockCountryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name }) => name}
                  labelLine={true}
                >
                  {mockCountryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

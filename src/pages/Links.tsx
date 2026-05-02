import { useState, useEffect } from 'react';
import { Search, Copy, DollarSign, LayoutDashboard, Trash2 } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';

interface LinkData {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  ctaText: string;
  visits: number;
  createdAt: string;
}

export default function Links() {
  const { token, isAuthenticated, impersonatedUser } = useAuth();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchLinks = async () => {
        try {
          const url = impersonatedUser 
            ? `https://jorgethelord.com/api/noti/get_links.php?target_user_id=${impersonatedUser.id}`
            : 'https://jorgethelord.com/api/noti/get_links.php';
            
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok) setLinks(data.links);
        } catch (error) {
          console.error("Failed fetching links", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLinks();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, impersonatedUser]);

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    alert('Enlace copiado al portapapeles');
  };

  const handleDelete = async (linkId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este enlace? Esta acción es irreversible y perderás las estadísticas de él.')) {
      return;
    }
    
    try {
      const response = await fetch(`https://jorgethelord.com/api/noti/delete_link.php?id=${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'No se pudo eliminar el enlace');
      
      setLinks(links.filter((l) => l.id !== linkId));
    } catch (err: any) {
      alert("Error al borrar: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#0c5562]">Mis Enlaces</h1>
        <div className="flex flex-wrap gap-2">
          <button className="bg-[#0c5562] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0a4650] transition-colors">
            Estadísticas Globales
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center bg-gray-50 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {links.length} Enlace(s) Creados
          </div>
          <div className="relative">
            <input
              type="text"
              className="border border-gray-300 rounded-md pl-8 pr-4 py-1.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#0c5562]"
              placeholder="Buscar enlace..."
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando enlaces...</div>
          ) : !isAuthenticated ? (
            <div className="p-8 text-center text-gray-500">Inicia sesión para ver tus enlaces acortados.</div>
          ) : links.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <LayoutDashboard className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Aún no tienes enlaces</p>
              <p className="text-gray-400 text-sm mt-1">Ve a "Acortar Enlace" en el menú para crear tu primero.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Campaña (CTA)</th>
                  <th className="px-4 py-3 font-semibold">URL Acortada</th>
                  <th className="px-4 py-3 font-semibold text-center">Visitas</th>
                  <th className="px-4 py-3 font-semibold">URL Original</th>
                  <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800" title={link.ctaText}>
                      {link.ctaText || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCopy(link.shortUrl)} className="text-gray-400 hover:text-[#0c5562] transition-colors p-1" title="Copiar enlace">
                          <Copy className="w-4 h-4" />
                        </button>
                        <a href={link.shortUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                          {link.shortUrl.replace('https://', '')}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold text-xs">
                        {link.visits}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:underline truncate max-w-[200px] block text-xs">
                        {link.originalUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleDelete(link.id)} 
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors" 
                          title="Eliminar enlace definitivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>


        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600 bg-gray-50">
          <div>Mostrando registros del 1 al 10 de un total de 25 registros</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 bg-[#0c5562] text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#0c5562] text-white px-4 py-2 font-medium">
          Sobre las Visitas
        </div>
        <div className="p-4 text-sm text-gray-700">
          <ul className="list-disc pl-5 space-y-2">
            <li>Las visitas de Cuba no son válidas, por lo tanto no suman en el contador de visitas ni en las estadísticas.</li>
            <li>Una visita válida es una visita desde una sola dirección IP por Enlace en un período de 24 horas y se cuenta cuando el visitante pasa 10 segundos en la página temporal, no antes.</li>
            <li>En caso de que detectemos algun método artificial o fraudulento para generar visitas, su cuenta quedará eliminada.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

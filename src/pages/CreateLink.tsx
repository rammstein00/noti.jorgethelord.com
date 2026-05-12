import { useState, useEffect } from 'react';
import { Scissors, Sparkles, Eye, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';

export default function CreateLink() {
  const [url, setUrl] = useState('');
  const [cta, setCta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  
  const [previewData, setPreviewData] = useState<{title: string, description: string, image: string | null, domain: string}>({
    title: 'Introduce un enlace para ver la vista previa',
    description: 'La información y la imagen del artículo original aparecerán aquí automáticamente.',
    image: null,
    domain: 'jorgethelord.com'
  });
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const { token, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!url || !url.startsWith('http')) {
      setPreviewData({
        title: 'Introduce un enlace válido',
        description: 'La información y la imagen del artículo original aparecerán aquí automáticamente.',
        image: null,
        domain: 'jorgethelord.com'
      });
      return;
    }

    if (!token) return;

    const timeoutId = setTimeout(async () => {
      setIsLoadingPreview(true);
      try {
        const response = await fetch(`https://jorgethelord.com/api/noti/fetch_preview.php?url=${encodeURIComponent(url)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setPreviewData({
            title: data.title,
            description: data.description,
            image: data.image,
            domain: data.domain
          });
        }
      } catch (e) {
        console.error("Error al cargar la vista previa", e);
      } finally {
        setIsLoadingPreview(false);
      }
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [url, token]);

  const handleShorten = async () => {
    if (!url) {
      setError('Por favor, ingresa un enlace para acortar.');
      return;
    }
    
    if (!isAuthenticated || !token) {
      setError('Debes iniciar sesión para acortar enlaces.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('https://jorgethelord.com/api/noti/create_link.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUrl: url, ctaText: cta }),
      });

      const data = await response.json();

      // If token expired, auto-logout
      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) throw new Error(data.error || 'Error al acortar enlance');
      
      setShortUrl(data.link.shortUrl);
      setSuccess('¡Enlace acortado con éxito!');
      setUrl('');
      setCta('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      alert('¡Copiado al portapapeles!');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0c5562]">Creación de enlace</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 relative">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-md flex flex-col gap-3 border border-green-200">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {success}
              </div>
              {shortUrl && (
                <div className="flex bg-white items-center justify-between p-2 rounded border border-green-200 shadow-sm">
                  <span className="text-sm font-bold text-[#0c5562] break-all">{shortUrl}</span>
                  <button onClick={copyToClipboard} className="text-gray-400 hover:text-green-600 p-1">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace de destino *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://pagina.com/noticia/..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0c5562]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Título / Llamada a la acción (Opcional)</label>
            </div>
            <div className="relative">
              <textarea
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Ej. ¡Mira esta increíble noticia!"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0c5562] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleShorten}
              disabled={isLoading || !isAuthenticated}
              className="bg-[#0c5562] text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#0a4650] disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Recortando...' : (
                <>
                  <Scissors className="w-4 h-4" />
                  Acortar!
                </>
              )}
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-green-600">
              IA <Sparkles className="w-4 h-4" />
            </button>
            <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Previsualizar
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-2 mb-4">
            <select className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none">
              <option>Mejorar Imagen con IA</option>
            </select>
            <button className="bg-green-500 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-green-600">
              Aplicar <Sparkles className="w-4 h-4" />
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            {isLoadingPreview ? (
              <div className="h-48 flex items-center justify-center bg-gray-100 animate-pulse">
                <span className="text-gray-400 font-medium">Cargando vista previa...</span>
              </div>
            ) : previewData.image ? (
              <img 
                src={previewData.image} 
                alt="Preview" 
                className="w-full h-auto max-h-64 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-200 border-b border-gray-200 shadow-inner">
                <Scissors className="w-10 h-10 text-gray-300" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-gray-900 leading-tight">
                {isLoadingPreview ? '...' : previewData.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {isLoadingPreview ? '...' : previewData.description}
              </p>
              <div className="text-xs font-medium text-gray-400 uppercase">
                {isLoadingPreview ? '...' : previewData.domain}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1 hover:bg-green-600">
              Nueva Imagen con IA <Sparkles className="w-4 h-4" />
            </button>
            <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1 hover:bg-blue-600">
              <Eye className="w-4 h-4" /> Ver Galería IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

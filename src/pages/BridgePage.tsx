import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Menu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BridgePage() {
  const { code } = useParams();
  const [countdown, setCountdown] = useState(15);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validar código en API y obtener la URL original y owner
    const fetchTarget = async () => {
      try {
        const response = await fetch(`https://jorgethelord.com/api/noti/get_target.php?code=${code}`);
        const data = await response.json();
        
        if (response.ok) {
          // Redirección del 15% a noticriisp temporalmente desactivada a petición del usuario
          /*
          if (data.mirrored && Math.random() < 0.15) {
            window.location.href = `https://jorgethelord.com/l/${code}`;
            return;
          }
          */
          setTargetUrl(data.originalUrl);
          setOwnerId(data.ownerId);
        } else {
          setError(data.error || 'Enlace no válido o expirado');
        }
      } catch (err) {
        setError('Error al procesar el enlace. Intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTarget();
  }, [code]);

  useEffect(() => {
    // Trigger AdsKeeper load when the target is resolved and content is shown
    if (!isLoading && !error && targetUrl) {
      // @ts-ignore
      window._mgq = window._mgq || [];
      // @ts-ignore
      window._mgq.push(["_mgc.load"]);
    }
  }, [isLoading, error, targetUrl]);

  useEffect(() => {
    // 2. Iniciar el contador regresivo de 15 a 0
    if (!isLoading && !error && targetUrl && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading, error, targetUrl, countdown]);

  const handleRedirect = () => {
    if (targetUrl && countdown === 0) {
      window.location.href = targetUrl;
    }
  };

  // Fake categories for the bridge page navbar
  const categories = [
    'Belleza', 'Celebridades', 'Ciencia', 'Cultura', 
    'Curiosidades', 'Deporte', 'Enigmas', 'Estilo de Vida', 'Health', 'Tech'
  ];

  // Logic map for widget multi-tenancy
  const widgetMap: Record<number, [string, string, string, string]> = {
    9:  ["1993803", "1993804", "1993805", "1993806"], // Manolo
    10: ["1993821", "1993822", "1993823", "1993824"], // Fermin
  };
  const defaultWidgets: [string, string, string, string] = ["1989745", "1989746", "1989747", "1989749"]; // Gato/Admin
  const [widgetTop, widgetMid, widgetBot, widgetPop] = (ownerId && widgetMap[ownerId]) ? widgetMap[ownerId] : defaultWidgets;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center">
      {/* Fake News Navigation Bar */}
      <header className="w-full bg-[#035bcc] shadow-md z-[99999] sticky top-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-[56px] flex justify-between items-center text-white relative">
          
          {/* Menu Hamburger Left */}
          <button className="p-1 hover:bg-white/10 rounded transition-colors flex items-center">
            <Menu className="w-8 h-8" strokeWidth={2.5} />
          </button>

          {/* Logo Center */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center cursor-pointer">
            <div className="text-xl font-black tracking-tight text-[#ff3b00] drop-shadow-sm flex items-center gap-1">
              <div className="bg-[#cc0000] text-white text-xs px-1.5 py-0.5 rounded-sm font-bold border border-yellow-500">NC</div>
              <span>NotiCrisp<span className="text-white">.com</span></span>
            </div>
            <div className="text-[7px] sm:text-[8px] text-yellow-400 uppercase font-bold tracking-widest -mt-0.5 drop-shadow-sm">
              EL MEJOR CONTENIDO DE LA RED
            </div>
          </div>

          {/* Search Icon Right */}
          <button className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Search className="w-5 h-5 text-white" strokeWidth={2} />
          </button>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-1 pt-2 pb-8 sm:px-4 sm:py-16 flex flex-col items-center justify-start relative">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-[#3d2780] mt-32"
            >
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="font-medium animate-pulse">Cargando artículo seguro...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md border border-red-200 text-center shadow-lg mt-32"
            >
              <h2 className="text-xl font-bold mb-2">¡Ups! Algo salió mal</h2>
              <p>{error}</p>
            </motion.div>
          )}

          {!isLoading && !error && targetUrl && (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center w-full max-w-[98%] md:max-w-[850px] mt-1 md:mt-4 mb-4 z-10"
            >
              {/* Primer Bloque de anuncios (Antes del botón) */}
              <div className="w-full mb-4">
                <style>{`div[data-widget-id="${widgetTop}"] { min-height: 300px; }`}</style>
                <div data-type="_mgwidget" data-widget-id={widgetTop}></div>
              </div>

              {/* Segundo Bloque de anuncios (Antes del botón) */}
              <div className="w-full mb-6">
                <div data-type="_mgwidget" data-widget-id={widgetMid}></div>
              </div>

              {/* Botón Principal de Redirección */}
              <button
                onClick={handleRedirect}
                disabled={countdown > 0}
                className={`w-[85%] sm:w-[320px] py-[12px] text-white font-semibold rounded-[4px] text-[15px] sm:text-[16px] transition-all ${countdown === 0 ? 'hover:opacity-90 active:scale-[0.98]' : ''}`}
                style={{ backgroundColor: '#e24a32' }}
              >
                {countdown > 0 
                  ? `Articulo completo en: ${countdown} segundos` 
                  : 'VER ARTÍCULO COMPLETO AQUÍ'}
              </button>

              {/* Tercer Bloque de anuncios (Debajo del botón) */}
              <div className="w-full mt-8">
                <div data-type="_mgwidget" data-widget-id={widgetBot}></div>
              </div>

              {/* Bloque Popup u Oculto */}
              <div data-type="_mgwidget" data-widget-id={widgetPop}></div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer footer */}
      <footer className="w-full bg-gray-50 py-6 text-center text-gray-400 text-xs">
        &copy; {new Date().getFullYear()} NotiFresh. Todos los derechos reservados.
      </footer>
    </div>
  );
}

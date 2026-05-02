import { mockTrending } from '../data/mock';
import { Search, Copy, Calendar } from 'lucide-react';

export default function Trending() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0c5562]">Trending links</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>02 Apr 26 - 02 Apr 26</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-sm text-gray-700">
        En este Dashboard puedes ver las estadisticas de tus Enlaces en un determinado período de tiempo, lo puedes usar para ver que fue lo que te funcionó hoy, ayer, la semana pasada, si algún enlace que ya habias posteado hace tiempo ayer volvió a subir en visitas, para de esta forma sacar tus propias conclusiones.
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Mostrar
            <select className="border border-gray-300 rounded px-2 py-1 bg-white">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            registros
          </div>
          <div className="relative">
            <input
              type="text"
              className="border border-gray-300 rounded-md pl-8 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#0c5562]"
              placeholder="Buscar..."
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha ↕</th>
                <th className="px-4 py-3 font-semibold">Imagen</th>
                <th className="px-4 py-3 font-semibold">Título ↕</th>
                <th className="px-4 py-3 font-semibold">Llamada a la acción ↕</th>
                <th className="px-4 py-3 font-semibold">Descripción ↕</th>
                <th className="px-4 py-3 font-semibold">Visitas ↕</th>
                <th className="px-4 py-3 font-semibold">Enlace ↕</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockTrending.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.date}</td>
                  <td className="px-4 py-3">
                    <img src={item.image} alt="Thumbnail" className="w-24 h-16 object-cover rounded" referrerPolicy="no-referrer" />
                  </td>
                  <td className="px-4 py-3 max-w-[200px] text-gray-800 font-medium">{item.title}</td>
                  <td className="px-4 py-3 max-w-[200px] text-gray-600">{item.cta}</td>
                  <td className="px-4 py-3 max-w-[200px] text-gray-500 text-xs">{item.desc}</td>
                  <td className="px-4 py-3 font-bold">{item.visits}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.domain}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="bg-[#0c5562] text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 hover:bg-[#0a4650] mx-auto">
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600 bg-gray-50">
          <div>Mostrando registros del 1 al 10 de un total de 19 registros</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 bg-[#0c5562] text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { mockSuggestions } from '../data/mock';
import { Search, Scissors } from 'lucide-react';

export default function Suggestions() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0c5562]">Sugerencias diarias de enlaces</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-sm text-gray-700 space-y-2">
        <p>En este Dashboard puedes ver diariamente un listado de enlaces que hemos confeccionado para ti y que te recomendamos acortar pues están siendo virales dias atrás.</p>
        <p className="text-xs text-gray-500 uppercase">EL ORDEN NO IMPLICA LA CANTIDAD DE VISITAS.</p>
        <p className="bg-blue-100 text-blue-800 px-2 py-1 inline-block rounded text-xs font-bold">NO ES OBLIGATORIO ACORTAR ESTOS ENLACES</p>
        <p className="bg-red-100 text-red-800 px-2 py-1 inline-block rounded text-xs font-bold ml-2">MUCHOS DE ESTOS ENLACES NO CUMPLEN CON LAS POLITICAS DE NUESTROS GRUPOS, LOS PUEDE ACORTAR PERO NO LOS COMPARTA EN LOS GRUPOS NUESTROS</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button className="px-4 py-2 bg-[#0c5562] text-white text-sm font-medium rounded-t-md">Diarias</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-t-md hover:bg-gray-200">Históricas</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-t-md hover:bg-gray-200">Youtube</button>
      </div>

      <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm border border-gray-200 overflow-hidden -mt-px">
        <div className="p-4 border-b border-gray-200 flex justify-end bg-gray-50">
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
                <th className="px-4 py-3 font-semibold">Imagen ↕</th>
                <th className="px-4 py-3 font-semibold">Título ↕</th>
                <th className="px-4 py-3 font-semibold">Enlace ↕</th>
                <th className="px-4 py-3 font-semibold text-center">Acortar ↕</th>
              </tr>
            </thead>
            <tbody>
              {mockSuggestions.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <img src={item.image} alt="Thumbnail" className="w-24 h-16 object-cover rounded" referrerPolicy="no-referrer" />
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.domain}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="bg-[#0c5562] text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 hover:bg-[#0a4650] mx-auto">
                      <Scissors className="w-3 h-3" /> Acortar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500 bg-gray-50">
          Mostrando registros del 1 al 30 de un total de 30 registros
        </div>
      </div>
    </div>
  );
}

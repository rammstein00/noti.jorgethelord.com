import { mockBilling } from '../data/mock';
import { Wallet, DollarSign, Search } from 'lucide-react';

export default function Billing() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0c5562]">Facturación y Retiros</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex overflow-hidden">
          <div className="bg-red-500 p-4 flex items-center justify-center w-24 shrink-0">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="p-4 flex-1">
            <div className="text-3xl font-light text-red-500">$6.07</div>
            <div className="text-sm text-gray-500 font-medium">Saldo Disponible</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex overflow-hidden">
          <div className="bg-green-500 p-4 flex items-center justify-center w-24 shrink-0">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <div className="p-4 flex-1">
            <div className="text-3xl font-light text-green-500">$0.00</div>
            <div className="text-sm text-gray-500 font-medium">Retirado</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="bg-[#0c5562] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#0a4650] transition-colors">
          Solicitar Retiro
        </button>
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
                <th className="px-4 py-3 font-semibold">ID ↕</th>
                <th className="px-4 py-3 font-semibold">Estado ↕</th>
                <th className="px-4 py-3 font-semibold">Monto ↕</th>
                <th className="px-4 py-3 font-semibold">Método ↕</th>
                <th className="px-4 py-3 font-semibold">Cuenta ↕</th>
                <th className="px-4 py-3 font-semibold">Notas ↕</th>
              </tr>
            </thead>
            <tbody>
              {mockBilling.length > 0 ? (
                mockBilling.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.date}</td>
                    <td className="px-4 py-3 text-gray-800">{item.id}</td>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">${item.amount}</td>
                    <td className="px-4 py-3 text-gray-600">{item.method}</td>
                    <td className="px-4 py-3 text-gray-600">{item.account}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Ningún dato disponible en esta tabla
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600 bg-gray-50">
          <div>Mostrando registros del 0 al 0 de un total de 0 registros</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}

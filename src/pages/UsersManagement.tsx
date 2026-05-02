import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { Trash2, UserPlus, Loader2, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';

export default function UsersManagement() {
  const { user, token, impersonateUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Protect route
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Acceso Denegado</h2>
        <p className="text-gray-600 mt-2">No tienes permisos de Super Administrador para ver esta página.</p>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://jorgethelord.com/api/noti/get_users.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar a este usuario permanentemente? Sus enlaces seguirán existiendo, pero no podrá entrar más.')) return;
    
    try {
      const response = await fetch(`https://jorgethelord.com/api/noti/delete_user.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo eliminar');
      
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setIsCreating(true);

    try {
      const emailFormatted = newUsername.includes('@') ? newUsername : `${newUsername}@jorgethelord.com`;
      const response = await fetch('https://jorgethelord.com/api/noti/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newUsername, 
          email: emailFormatted, 
          password: newPassword 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear la cuenta');
      
      setCreateSuccess(`¡Usuario ${newUsername} creado con éxito!`);
      setNewUsername('');
      setNewPassword('');
      fetchUsers(); // Refresh list

    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImpersonate = (u: any) => {
    if (!impersonateUser) return;
    impersonateUser(u);
    // You could also auto-navigate to /links here natively
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-[#0c5562]" />
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CREATE FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">Añadir Nuevo Usuario</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{createError}</p>}
            {createSuccess && <p className="text-green-600 text-sm bg-green-50 p-2 rounded">{createSuccess}</p>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Ejemplo: gato2"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0c5562]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0c5562]"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-[#0c5562] hover:bg-[#0a4650] text-white py-2 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Registrar Cuenta
            </button>
          </form>
        </div>

        {/* USERS LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : error ? (
            <div className="p-6 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Usuario</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Login Key (Email Oculto)</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Rol</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 cursor-help" title={u.email}>
                        {u.name} {u.role === 'admin' && '👑'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {u.role !== 'admin' && (
                          <>
                            <button 
                              onClick={() => handleImpersonate(u)}
                              className="text-blue-500 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded"
                              title="Ver como este usuario"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay usuarios registrados aparte del sistema maestro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

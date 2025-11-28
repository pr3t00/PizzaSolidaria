import React, { useState } from 'react';
import { AppData, UserRole } from '../types';
import { Trash2, Plus, Shield, ShieldAlert, Database } from 'lucide-react';

interface SettingsProps {
  data: AppData;
  role: UserRole;
  setRole: (role: UserRole) => void;
  onAddFlavor: (name: string) => void;
  onRemoveFlavor: (id: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, role, setRole, onAddFlavor, onRemoveFlavor }) => {
  const [newFlavor, setNewFlavor] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFlavor.trim()) {
      onAddFlavor(newFlavor.trim());
      setNewFlavor('');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      
      {/* Role Toggle Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="text-purple-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Permissões de Usuário</h2>
        </div>
        <p className="text-gray-500 mb-6 text-sm">
          Simule como o aplicativo se comporta para diferentes tipos de usuário.
          O <b>Admin</b> pode editar e alterar status. O <b>Viewer</b> apenas visualiza.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => setRole('ADMIN')}
            className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition ${
              role === 'ADMIN' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Shield size={24} />
            <span className="font-bold">Modo Admin</span>
          </button>
          <button
            onClick={() => setRole('VIEWER')}
            className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition ${
              role === 'VIEWER' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Database size={24} />
            <span className="font-bold">Modo Leitura</span>
          </button>
        </div>
      </div>

      {/* Flavors Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Sabores</h2>
        
        {role === 'ADMIN' ? (
          <>
            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newFlavor}
                onChange={(e) => setNewFlavor(e.target.value)}
                placeholder="Novo sabor (ex: Quatro Queijos)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newFlavor.trim()}
                className="bg-orange-500 text-white px-6 rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                <Plus size={18} /> Adicionar
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.flavors.map(flavor => (
                <div key={flavor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-700">{flavor.name}</span>
                  <button
                    onClick={() => onRemoveFlavor(flavor.id)}
                    className="text-gray-400 hover:text-red-500 transition p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            Você está em modo leitura. Mude para Admin para editar sabores.
          </div>
        )}
      </div>
    </div>
  );
};

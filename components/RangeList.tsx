import React, { useState } from 'react';
import { AppData, RANGES, UserRole, Order } from '../types';
import { CheckCircle, XCircle, ArrowLeft, Search, Pencil, Trash2, RefreshCcw, AlertOctagon } from 'lucide-react';

interface RangeListProps {
  data: AppData;
  role: UserRole;
  onCycleStatus: (number: number) => Promise<void>;
  onEdit: (order: Order) => void;
  onDelete: (number: number) => Promise<void>;
}

export const RangeList: React.FC<RangeListProps> = ({ data, role, onCycleStatus, onEdit, onDelete }) => {
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Função de exclusão direta (sem confirmação)
  const handleDeleteClick = async (num: number) => {
    try {
      await onDelete(num);
    } catch (error) {
      console.error("Erro ao excluir", error);
    }
  };

  // View: Grid of Buttons
  if (selectedRangeIndex === null) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800">Selecione uma Faixa</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RANGES.map((range, idx) => {
            // Count items in this range
            const count = data.orders.filter(o => o.number >= range.min && o.number <= range.max).length;
            const isFull = count === (range.max - range.min + 1);
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedRangeIndex(idx)}
                className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md text-left relative overflow-hidden group ${
                   isFull ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="relative z-10">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Faixa</span>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{range.label}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{count} lançamentos</span>
                  </div>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-orange-100 to-transparent rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // View: Detailed List
  const range = RANGES[selectedRangeIndex];
  
  // Create a normalized list of items for this range
  const rangeItems = Array.from({ length: range.max - range.min + 1 }, (_, i) => {
    const num = range.min + i;
    // Robust find: convert existing data number to Number() to ensure match
    const existingOrder = data.orders.find(o => Number(o.number) === num);
    return {
      number: num,
      ...existingOrder // undefined fields if not found
    };
  });

  const filteredItems = rangeItems.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.number.toString().includes(searchLower) ||
      (item.flavor && item.flavor.toLowerCase().includes(searchLower)) ||
      (item.team && item.team.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => setSelectedRangeIndex(null)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft size={20} className="mr-2" />
          Voltar para Faixas
        </button>
        <h2 className="text-xl font-bold text-gray-800">Lançamentos: {range.label}</h2>
        
        {/* Search within range */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="p-2 md:p-4 w-12 text-center">Nº</th>
                <th className="p-2 md:p-4">Pizza / Detalhes</th>
                <th className="hidden md:table-cell p-4">Equipe</th>
                <th className="hidden md:table-cell p-4 text-center">Status</th>
                {role === 'ADMIN' && <th className="p-2 md:p-4 text-center w-auto md:w-48">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const hasData = !!item.flavor; // Check if order data exists
                
                // Helper render status icon for mobile inline view
                const renderMobileStatus = () => {
                   if (!hasData) return null;
                   if (item.status === 'DELIVERED') return <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Entregue</span>;
                   if (item.status === 'RETURNED') return <span className="text-purple-600 flex items-center gap-1"><AlertOctagon size={12}/> Devolvida</span>;
                   return <span className="text-red-500 flex items-center gap-1"><XCircle size={12}/> Pendente</span>;
                };

                return (
                  <tr 
                    key={item.number} 
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${!hasData ? 'opacity-60' : ''}`}
                  >
                    {/* Coluna 1: Número */}
                    <td className="p-2 md:p-4 font-bold text-gray-700 text-center align-middle">{item.number}</td>
                    
                    {/* Coluna 2: Detalhes (Sabor + Mobile Info) */}
                    <td className="p-2 md:p-4 align-middle">
                      {hasData ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-block px-2 py-1 bg-orange-50 text-orange-700 text-sm rounded-md font-medium border border-orange-100 w-fit">
                            {item.flavor}
                          </span>
                          {/* Mobile Only Info */}
                          <div className="md:hidden flex flex-col gap-0.5 mt-0.5 text-xs">
                             <span className="text-gray-500 font-medium truncate max-w-[120px]">{item.team}</span>
                             {renderMobileStatus()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">- Vazio -</span>
                      )}
                    </td>

                    {/* Coluna 3: Equipe (Desktop Only) */}
                    <td className="hidden md:table-cell p-4 text-gray-600 font-medium align-middle">
                      {item.team || '-'}
                    </td>

                    {/* Coluna 4: Status (Desktop Only) */}
                    <td className="hidden md:table-cell p-4 text-center align-middle">
                      {hasData ? (
                        item.status === 'DELIVERED' ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm">
                            <CheckCircle size={16} /> Entregue
                          </span>
                        ) : item.status === 'RETURNED' ? (
                          <span className="inline-flex items-center gap-1 text-purple-600 font-medium text-sm">
                            <AlertOctagon size={16} /> Devolvida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 font-medium text-sm">
                            <XCircle size={16} /> Pendente
                          </span>
                        )
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Coluna 5: Ações */}
                    {role === 'ADMIN' && (
                      <td className="p-2 md:p-4 text-center align-middle">
                        {hasData && (
                          <div className="flex items-center justify-end md:justify-center gap-1 md:gap-2">
                             <button
                              type="button"
                              onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                onCycleStatus(item.number); 
                              }}
                              title="Alternar Status"
                              className={`p-1.5 md:p-2 rounded-lg transition ${
                                item.status === 'DELIVERED' ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : item.status === 'RETURNED' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              }`}
                            >
                              <RefreshCcw size={16} />
                            </button>
                            
                            <button
                              type="button"
                              onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                onEdit(item as Order); 
                              }}
                              title="Editar"
                              className="p-1.5 md:p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                            >
                              <Pencil size={16} />
                            </button>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteClick(item.number);
                              }}
                              title="Excluir"
                              className="p-1.5 md:p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={role === 'ADMIN' ? 5 : 4} className="p-8 text-center text-gray-500">
                    Nenhum lançamento encontrado nesta busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { AppData, RANGES, Order, OrderStatus } from '../types';
import { Save, AlertCircle, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

interface OrderEntryProps {
  data: AppData;
  initialOrder?: Order | null;
  onSave: (orderData: any) => Promise<void>;
  onCancel?: () => void;
}

export const OrderEntry: React.FC<OrderEntryProps> = ({ data, initialOrder, onSave, onCancel }) => {
  const [number, setNumber] = useState<string>('');
  const [team, setTeam] = useState('');
  const [flavor, setFlavor] = useState('');
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialOrder) {
      setNumber(initialOrder.number.toString());
      setTeam(initialOrder.team);
      setFlavor(initialOrder.flavor);
      setStatus(initialOrder.status);
    } else {
      // Reset if switching back to add mode
      setNumber('');
      setTeam('');
      setFlavor('');
      setStatus('PENDING');
    }
    setSuccess(false);
    setError(null);
  }, [initialOrder]);

  // Helper to find range name based on number
  const getRangeName = (num: number) => {
    const range = RANGES.find(r => num >= r.min && num <= r.max);
    return range ? range.label : 'Fora do limite (1-400)';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const numInt = parseInt(number);
    if (isNaN(numInt) || numInt < 1 || numInt > 400) {
      setError('O número deve ser entre 1 e 400.');
      return;
    }
    if (!flavor) {
      setError('Selecione um sabor.');
      return;
    }
    // Team validation removed to make it optional

    setLoading(true);
    try {
      await onSave({
        id: initialOrder?.id || Date.now().toString(),
        number: numInt,
        team,
        flavor,
        status,
        timestamp: Date.now()
      });
      setSuccess(true);
      
      if (!initialOrder) {
        // Only reset if it's a new entry
        setNumber('');
        setFlavor('');
        setTeam(''); // Clear team as well
        setStatus('PENDING');
      }
    } catch (err) {
      setError('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
      <div className="bg-orange-500 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <Save size={20} />
            {initialOrder ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <p className="text-orange-100 text-sm mt-1">Preencha os dados da pizza</p>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-white bg-orange-600 hover:bg-orange-700 p-2 rounded-lg text-sm flex items-center gap-1 transition"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">
            {initialOrder ? 'Alterações salvas com sucesso!' : 'Lançamento salvo com sucesso!'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Number Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Número (1-400)</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={!!initialOrder}
              className={`w-full p-3 border border-gray-300 rounded-lg outline-none transition ${
                initialOrder ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              }`}
              placeholder="Ex: 42"
              autoFocus={!initialOrder}
            />
            {number && (
              <p className="text-xs text-gray-500">
                Aba Destino: <span className="font-semibold text-orange-600">{getRangeName(parseInt(number))}</span>
              </p>
            )}
          </div>

          {/* Flavor Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sabor</label>
            <select
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Selecione...</option>
              {data.flavors.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Team Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Equipe <span className="text-gray-400 font-normal">(Opcional)</span></label>
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              placeholder="Ex: Rocket Team"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-2 col-span-1 md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-2">Status da Entrega</label>
             <div className="grid grid-cols-3 gap-3">
               
               <button
                  type="button"
                  onClick={() => setStatus('PENDING')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${
                    status === 'PENDING' 
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-500'
                  }`}
               >
                 <Clock size={20} className="mb-1" />
                 <span className="text-xs font-bold">Pendente</span>
               </button>

               <button
                  type="button"
                  onClick={() => setStatus('DELIVERED')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${
                    status === 'DELIVERED' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-500'
                  }`}
               >
                 <CheckCircle size={20} className="mb-1" />
                 <span className="text-xs font-bold">Entregue</span>
               </button>

               <button
                  type="button"
                  onClick={() => setStatus('RETURNED')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${
                    status === 'RETURNED' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-500'
                  }`}
               >
                 <XCircle size={20} className="mb-1" />
                 <span className="text-xs font-bold">Devolvida</span>
               </button>

             </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : (initialOrder ? 'Salvar Alterações' : 'Salvar Lançamento')}
        </button>
      </form>
    </div>
  );
};
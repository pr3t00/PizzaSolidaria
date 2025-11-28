import React, { useMemo } from 'react';
import { AppData } from '../types';
import { PackageCheck, Clock, AlertCircle, Pizza, TrendingUp } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const stats = useMemo(() => {
    const total = data.orders.length;
    const delivered = data.orders.filter(o => o.status === 'DELIVERED').length;
    const returned = data.orders.filter(o => o.status === 'RETURNED').length;
    const pending = data.orders.filter(o => o.status === 'PENDING').length; // More explicit count
    
    // Group by flavor
    const flavorStats: Record<string, { total: number; delivered: number; pending: number; returned: number }> = {};
    
    data.orders.forEach(o => {
      if (!flavorStats[o.flavor]) {
        flavorStats[o.flavor] = { total: 0, delivered: 0, pending: 0, returned: 0 };
      }
      flavorStats[o.flavor].total += 1;
      
      if (o.status === 'DELIVERED') {
        flavorStats[o.flavor].delivered += 1;
      } else if (o.status === 'RETURNED') {
        flavorStats[o.flavor].returned += 1;
      } else {
        flavorStats[o.flavor].pending += 1;
      }
    });

    // Convert to array and sort by total
    const flavors = Object.entries(flavorStats)
      .map(([name, stat]) => ({
        name,
        ...stat,
        percentage: stat.total > 0 ? Math.round((stat.delivered / stat.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);

    return { total, delivered, pending, returned, flavors };
  }, [data.orders]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner - Updated color to orange-500 */}
      <div className="bg-orange-500 rounded-xl p-8 shadow-md text-white">
        <div className="flex items-center gap-3 mb-2">
          <Pizza size={32} className="opacity-90" />
          <h1 className="text-3xl font-bold">Dashboard Pizza Solidária</h1>
        </div>
        <p className="text-white/80 text-lg">Controle de Entregas</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Vendidas */}
        <div className="bg-[#FFEBEE] p-6 rounded-xl flex items-center justify-between border border-red-100">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Vendidas</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-3 rounded-full shadow-sm">
             <Pizza size={24} className="text-[#EF5350]" />
          </div>
        </div>

        {/* Total Entregues */}
        <div className="bg-[#E8F5E9] p-6 rounded-xl flex items-center justify-between border border-green-100">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Entregues</p>
            <p className="text-3xl font-bold text-gray-800">{stats.delivered}</p>
          </div>
          <div className="bg-white p-3 rounded-full shadow-sm">
             <PackageCheck size={24} className="text-[#4CAF50]" />
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-[#FFF8E1] p-6 rounded-xl flex items-center justify-between border border-yellow-100">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Pendentes</p>
            <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
          </div>
          <div className="bg-white p-3 rounded-full shadow-sm">
             <Clock size={24} className="text-[#FFC107]" />
          </div>
        </div>

        {/* Devolvidas */}
        <div className="bg-[#F3E5F5] p-6 rounded-xl flex items-center justify-between border border-purple-100">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Devolvidas</p>
            <p className="text-3xl font-bold text-gray-800">{stats.returned}</p>
          </div>
          <div className="bg-white p-3 rounded-full shadow-sm">
             <AlertCircle size={24} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Por Sabor Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-[#EF5350]" />
          <h2 className="text-xl font-bold text-gray-800">Por Sabor</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.flavors.length > 0 ? (
            stats.flavors.map((flavor) => {
              const color = getColorForFlavor(flavor.name);
              
              return (
                <div key={flavor.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="p-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: color }}
                    >
                      <Pizza size={24} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{flavor.name}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Vendidas</span>
                      <span className="font-bold text-gray-800">{flavor.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Entregues</span>
                      <span className="font-bold text-green-600">{flavor.delivered}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Devolvidas</span>
                      <span className="font-bold text-purple-600">{flavor.returned}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Restantes</span>
                      <span className="font-bold text-orange-500">{flavor.pending}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${flavor.percentage}%`, backgroundColor: color }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-400">{flavor.percentage}% entregue</p>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
               Nenhum lançamento registrado ainda.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Expanded palette for varied colors
const FLAVOR_COLORS = [
  '#EF5350', // Red
  '#AB47BC', // Purple
  '#5C6BC0', // Indigo
  '#42A5F5', // Blue
  '#26C6DA', // Cyan
  '#26A69A', // Teal
  '#66BB6A', // Green
  '#9CCC65', // Light Green
  '#D4E157', // Lime
  '#FFCA28', // Amber
  '#FFA726', // Orange
  '#FF7043', // Deep Orange
  '#8D6E63', // Brown
  '#78909C', // Blue Grey
  '#EC407A', // Pink
];

// Deterministically get a color based on the flavor name
const getColorForFlavor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FLAVOR_COLORS.length;
  return FLAVOR_COLORS[index];
};
import React, { useState, useEffect } from 'react';
import { AppData, UserRole, Order } from './types';
import * as storage from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { OrderEntry } from './components/OrderEntry';
import { RangeList } from './components/RangeList';
import { Settings } from './components/Settings';
import { LayoutDashboard, List, PlusCircle, Settings as SettingsIcon, Pizza } from 'lucide-react';

// Simple Router Type
type View = 'DASHBOARD' | 'RANGES' | 'ENTRY' | 'SETTINGS';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [data, setData] = useState<AppData>({ orders: [], flavors: [] });
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for editing
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const d = await storage.getAppData();
    setData(d);
    setIsLoading(false);
  };

  const handleSaveOrder = async (order: any) => {
    const newData = await storage.saveOrder(order);
    setData(newData);
    // If we were editing, stop editing state
    if (editingOrder) {
        setEditingOrder(null);
        // Optionally go back to list
        setCurrentView('RANGES');
    }
  };

  const handleCycleStatus = async (number: number) => {
    if (role !== 'ADMIN') return;
    const newData = await storage.cycleOrderStatus(number);
    setData(newData);
  };

  const handleEditOrder = (order: Order) => {
    if (role !== 'ADMIN') return;
    setEditingOrder(order);
    setCurrentView('ENTRY');
  };

  const handleDeleteOrder = async (number: number) => {
    if (role !== 'ADMIN') return;
    const newData = await storage.deleteOrder(number);
    setData(newData);
  };

  const handleAddFlavor = async (name: string) => {
    const newData = await storage.addFlavor(name);
    setData(newData);
  };

  const handleRemoveFlavor = async (id: string) => {
    const newData = await storage.removeFlavor(id);
    setData(newData);
  };

  // When manually clicking "Lançar" (Add), ensure we clear edit mode
  const handleSwitchToEntry = () => {
    setEditingOrder(null);
    setCurrentView('ENTRY');
  }

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingOrder(null);
    setCurrentView('RANGES'); // Go back to list
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* Sidebar / Mobile Tab Bar */}
      <nav className="md:w-64 bg-white border-r border-gray-200 fixed md:relative bottom-0 w-full md:h-screen z-50 flex md:flex-col justify-around md:justify-start">
        <div className="hidden md:flex items-center gap-3 px-6 py-8">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <Pizza size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Pizza Solidária</h1>
        </div>

        <div className="flex md:flex-col w-full md:px-4 md:gap-2">
          <NavButton 
            active={currentView === 'DASHBOARD'} 
            onClick={() => setCurrentView('DASHBOARD')} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={currentView === 'RANGES'} 
            onClick={() => setCurrentView('RANGES')} 
            icon={<List size={20} />} 
            label="Listas 1-400" 
          />
          {role === 'ADMIN' && (
            <NavButton 
              active={currentView === 'ENTRY'} 
              onClick={handleSwitchToEntry} 
              icon={<PlusCircle size={20} />} 
              label="Lançar" 
            />
          )}
          <NavButton 
            active={currentView === 'SETTINGS'} 
            onClick={() => setCurrentView('SETTINGS')} 
            icon={<SettingsIcon size={20} />} 
            label="Configurações" 
          />
        </div>
        
        <div className="hidden md:block mt-auto px-6 py-8">
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-500 text-center">
            {role === 'ADMIN' ? 'Modo: Administrador' : 'Modo: Visualizador'}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center md:hidden">
           <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded text-white">
                <Pizza size={20} />
              </div>
              <h1 className="font-bold text-lg">Pizza Solidária</h1>
           </div>
        </header>

        {currentView === 'DASHBOARD' && <Dashboard data={data} />}
        
        {currentView === 'RANGES' && (
          <RangeList 
            data={data} 
            role={role} 
            onCycleStatus={handleCycleStatus} 
            onEdit={handleEditOrder}
            onDelete={handleDeleteOrder}
          />
        )}
        
        {currentView === 'ENTRY' && (
          <OrderEntry 
            data={data} 
            initialOrder={editingOrder} 
            onSave={handleSaveOrder} 
            onCancel={editingOrder ? handleCancelEdit : undefined}
          />
        )}
        
        {currentView === 'SETTINGS' && (
          <Settings 
            data={data} 
            role={role} 
            setRole={setRole} 
            onAddFlavor={handleAddFlavor} 
            onRemoveFlavor={handleRemoveFlavor}
          />
        )}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all w-full ${
      active 
        ? 'text-orange-600 bg-orange-50 md:bg-orange-50' 
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className={`text-[10px] md:text-sm font-medium mt-1 md:mt-0 ${active ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

export default App;
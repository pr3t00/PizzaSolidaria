import { AppData, Flavor, Order, OrderStatus } from '../types';

const STORAGE_KEY = 'pizza_tracker_db_v2'; // Bumped version to ensure clean slate or force migration logic

const INITIAL_FLAVORS: Flavor[] = [
  { id: '1', name: 'Mussarela' },
  { id: '2', name: 'Calabresa' },
  { id: '3', name: 'Portuguesa' },
  { id: '4', name: 'Frango com Catupiry' },
  { id: '5', name: 'Marguerita' },
];

const INITIAL_DATA: AppData = {
  orders: [],
  flavors: INITIAL_FLAVORS,
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAppData = async (): Promise<AppData> => {
  await delay(300); // Fake network latency
  
  // Try to get v2 data first
  let stored = localStorage.getItem(STORAGE_KEY);
  
  // Migration Logic: Check if v1 data exists and v2 doesn't
  if (!stored) {
    const oldData = localStorage.getItem('pizza_tracker_db_v1');
    if (oldData) {
      const parsedOld = JSON.parse(oldData);
      // Migrate old format to new format
      const migratedOrders = parsedOld.orders.map((o: any) => ({
        id: o.id,
        number: o.number,
        flavor: o.flavor,
        team: o.team,
        timestamp: o.timestamp,
        // Convert boolean to Status
        status: o.isDelivered ? 'DELIVERED' : 'PENDING'
      }));
      
      const migratedData = { ...parsedOld, orders: migratedOrders };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
      return migratedData as AppData;
    }
    
    // If no old data either, init fresh
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  
  return JSON.parse(stored);
};

export const saveOrder = async (order: Order): Promise<AppData> => {
  const currentData = await getAppData();
  
  // Check if ID exists (update) or New based on Number
  const existingIndex = currentData.orders.findIndex(o => Number(o.number) === Number(order.number));
  
  let newOrders = [...currentData.orders];
  if (existingIndex >= 0) {
    const existingId = newOrders[existingIndex].id;
    newOrders[existingIndex] = { ...order, id: existingId };
  } else {
    newOrders.push(order);
  }

  const newData = { ...currentData, orders: newOrders };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

export const deleteOrder = async (number: number): Promise<AppData> => {
  const currentData = await getAppData();
  const newOrders = currentData.orders.filter(o => Number(o.number) !== Number(number));
  
  const newData = { ...currentData, orders: newOrders };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

// Cycles: PENDING -> DELIVERED -> RETURNED -> PENDING
export const cycleOrderStatus = async (orderNumber: number): Promise<AppData> => {
  const currentData = await getAppData();
  const newOrders = currentData.orders.map(o => {
    if (Number(o.number) === Number(orderNumber)) {
      let nextStatus: OrderStatus = 'PENDING';
      if (o.status === 'PENDING') nextStatus = 'DELIVERED';
      else if (o.status === 'DELIVERED') nextStatus = 'RETURNED';
      else if (o.status === 'RETURNED') nextStatus = 'PENDING';
      
      return { ...o, status: nextStatus };
    }
    return o;
  });
  const newData = { ...currentData, orders: newOrders };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

export const addFlavor = async (name: string): Promise<AppData> => {
  const currentData = await getAppData();
  const newFlavor: Flavor = { id: Date.now().toString(), name };
  const newData = { ...currentData, flavors: [...currentData.flavors, newFlavor] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

export const removeFlavor = async (id: string): Promise<AppData> => {
  const currentData = await getAppData();
  const newData = { ...currentData, flavors: currentData.flavors.filter(f => f.id !== id) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};
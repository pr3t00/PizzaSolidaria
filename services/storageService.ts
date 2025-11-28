import { AppData, Flavor, Order, OrderStatus } from '../types';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  doc, 
  writeBatch
} from 'firebase/firestore';

// --- CONSTANTES ---
const COLL_ORDERS = 'orders';
const COLL_FLAVORS = 'flavors';
const LS_KEY = 'pizza_solidaria_data_v2'; // Key para LocalStorage

const INITIAL_FLAVORS: Flavor[] = [
  { id: '1', name: 'Mussarela' },
  { id: '2', name: 'Calabresa' },
  { id: '3', name: 'Portuguesa' },
  { id: '4', name: 'Frango com Catupiry' },
  { id: '5', name: 'Marguerita' },
];

// --- HELPER LOCAL STORAGE ---
const getLocalData = (): AppData => {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return { orders: [], flavors: INITIAL_FLAVORS };
};

const saveLocalData = (data: AppData) => {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
};

// --- HELPER FIREBASE ---
const mapDocToOrder = (doc: any): Order => {
  const data = doc.data();
  return {
    id: doc.id,
    number: data.number,
    team: data.team,
    flavor: data.flavor,
    status: data.status,
    timestamp: data.timestamp
  };
};

// --- API ---

export const getAppData = async (): Promise<AppData> => {
  // MODO LOCAL
  if (!isFirebaseConfigured) {
    console.warn("Firebase não configurado. Usando LocalStorage.");
    return getLocalData();
  }

  // MODO FIREBASE
  try {
    // 1. Buscar Pedidos
    const ordersSnapshot = await getDocs(collection(db, COLL_ORDERS));
    const orders: Order[] = ordersSnapshot.docs.map(mapDocToOrder);
    
    // 2. Buscar Sabores
    const flavorsSnapshot = await getDocs(collection(db, COLL_FLAVORS));
    let flavors: Flavor[] = flavorsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      name: doc.data().name 
    }));

    // Se não tiver sabores no banco (primeira vez), cadastra os iniciais
    if (flavors.length === 0) {
      const batch = writeBatch(db);
      const newFlavors: Flavor[] = [];
      
      INITIAL_FLAVORS.forEach(f => {
        const docRef = doc(collection(db, COLL_FLAVORS));
        batch.set(docRef, { name: f.name });
        newFlavors.push({ id: docRef.id, name: f.name });
      });
      
      await batch.commit();
      flavors = newFlavors;
    }

    return { orders, flavors };
  } catch (error) {
    console.error("Erro ao conectar com Firebase:", error);
    // Fallback silencioso para não quebrar a UI
    return { orders: [], flavors: [] };
  }
};

export const saveOrder = async (order: Order): Promise<AppData> => {
  // MODO LOCAL
  if (!isFirebaseConfigured) {
    const data = getLocalData();
    // Remove se já existir (update)
    const otherOrders = data.orders.filter(o => Number(o.number) !== Number(order.number));
    const newData = {
      ...data,
      orders: [...otherOrders, order]
    };
    saveLocalData(newData);
    return newData;
  }

  // MODO FIREBASE
  try {
    const docRef = doc(db, COLL_ORDERS, String(order.number));
    await setDoc(docRef, {
      number: Number(order.number),
      team: order.team || '',
      flavor: order.flavor,
      status: order.status,
      timestamp: order.timestamp
    });
    return await getAppData();
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    throw error;
  }
};

export const deleteOrder = async (number: number): Promise<AppData> => {
  // MODO LOCAL
  if (!isFirebaseConfigured) {
    const data = getLocalData();
    const newData = {
      ...data,
      orders: data.orders.filter(o => Number(o.number) !== Number(number))
    };
    saveLocalData(newData);
    return newData;
  }

  // MODO FIREBASE
  try {
    await deleteDoc(doc(db, COLL_ORDERS, String(number)));
    return await getAppData();
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    throw error;
  }
};

export const cycleOrderStatus = async (orderNumber: number): Promise<AppData> => {
  // MODO LOCAL
  if (!isFirebaseConfigured) {
    const data = getLocalData();
    const updatedOrders = data.orders.map(o => {
      if (Number(o.number) === Number(orderNumber)) {
        let nextStatus: OrderStatus = 'PENDING';
        if (o.status === 'PENDING') nextStatus = 'DELIVERED';
        else if (o.status === 'DELIVERED') nextStatus = 'RETURNED';
        else if (o.status === 'RETURNED') nextStatus = 'PENDING';
        return { ...o, status: nextStatus };
      }
      return o;
    });
    const newData = { ...data, orders: updatedOrders };
    saveLocalData(newData);
    return newData;
  }

  // MODO FIREBASE
  try {
    const currentData = await getAppData();
    const order = currentData.orders.find(o => Number(o.number) === Number(orderNumber));
    
    if (order) {
      let nextStatus: OrderStatus = 'PENDING';
      if (order.status === 'PENDING') nextStatus = 'DELIVERED';
      else if (order.status === 'DELIVERED') nextStatus = 'RETURNED';
      else if (order.status === 'RETURNED') nextStatus = 'PENDING';

      const docRef = doc(db, COLL_ORDERS, String(orderNumber));
      await setDoc(docRef, { status: nextStatus }, { merge: true });
    }

    return await getAppData();
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
};

export const addFlavor = async (name: string): Promise<AppData> => {
  // MODO LOCAL
  if (!isFirebaseConfigured) {
    const data = getLocalData();
    const newFlavor = { id: Date.now().toString(), name };
    const newData = { ...data, flavors: [...data.flavors, newFlavor] };
    saveLocalData(newData);
    return newData;
  }

  // MODO FIREBASE
  try {
    await setDoc(doc(collection(db, COLL_FLAVORS)), { name });
    return await getAppData();
  } catch (error) {
    console.error("Erro ao adicionar sabor:", error);
    throw error;
  }
};

export const removeFlavor = async (id: string): Promise<AppData> => {
  // MODO LOCAL
  if (!isFirebaseConfigured) {
    const data = getLocalData();
    const newData = { ...data, flavors: data.flavors.filter(f => f.id !== id) };
    saveLocalData(newData);
    return newData;
  }

  // MODO FIREBASE
  try {
    await deleteDoc(doc(db, COLL_FLAVORS, id));
    return await getAppData();
  } catch (error) {
    console.error("Erro ao remover sabor:", error);
    throw error;
  }
};
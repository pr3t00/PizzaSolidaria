export type OrderStatus = 'PENDING' | 'DELIVERED' | 'RETURNED';

export interface Order {
  id: string;
  number: number; // The unique number (1-400)
  flavor: string;
  team: string;
  status: OrderStatus; // Changed from isDelivered boolean
  timestamp: number;
}

export interface Flavor {
  id: string;
  name: string;
}

export interface AppData {
  orders: Order[];
  flavors: Flavor[];
}

export type UserRole = 'ADMIN' | 'VIEWER';

export const RANGES = [
  { label: '1 - 50', min: 1, max: 50 },
  { label: '51 - 100', min: 51, max: 100 },
  { label: '101 - 150', min: 101, max: 150 },
  { label: '151 - 200', min: 151, max: 200 },
  { label: '201 - 250', min: 201, max: 250 },
  { label: '251 - 300', min: 251, max: 300 },
  { label: '301 - 350', min: 301, max: 350 },
  { label: '351 - 400', min: 351, max: 400 },
];
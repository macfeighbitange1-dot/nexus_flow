import axios from 'axios';

// The "Single Source of Truth" for your Rails Backend
const API = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Fetch individual warehouse stock levels
export const fetchInventory = () => API.get('/inventory_items');

// 2. Fetch the "Aletheia" Global Stats (Total Kenyan Stock)
export const fetchStats = () => API.get('/inventory_items/stats');

// 3. Execute an Atomic Stock Transfer
export const transferStock = (data: {
  product_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  amount: number;
}) => API.post('/stock_transfers', data);

export default API;

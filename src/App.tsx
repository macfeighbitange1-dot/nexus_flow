import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchInventory, fetchStats, transferStock } from './api/client';
import { useInventorySocket } from './hooks/useInventorySocket';

function App() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const CAPACITY_LIMIT = 1000; // The threshold for our Heatmap

  // 1. DATA QUERIES
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => (await fetchInventory()).data
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await fetchStats()).data
  });

  // PG Full-Text Search Query (Debounced via React Query logic)
  const { data: searchResults = [] } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      const res = await axios.get(`http://localhost:3000/api/v1/search?q=${searchTerm}`);
      return res.data;
    },
    enabled: searchTerm.length > 1
  });

  // 2. REAL-TIME SYNC
  useInventorySocket(() => {
    queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
  });

  // 3. OPTIMISTIC MUTATION
  const mutation = useMutation({
    mutationFn: transferStock,
    onMutate: async (newTransfer) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const previousInventory = queryClient.getQueryData(['inventory']);

      queryClient.setQueryData(['inventory'], (old: any[]) => 
        old.map(item => {
          if (item.warehouse_id === newTransfer.from_warehouse_id) {
            return { ...item, quantity: item.quantity - newTransfer.amount };
          }
          if (item.warehouse_id === newTransfer.to_warehouse_id) {
            return { ...item, quantity: item.quantity + newTransfer.amount };
          }
          return item;
        })
      );
      return { previousInventory };
    },
    onError: (err, __, context) => {
      queryClient.setQueryData(['inventory'], context?.previousInventory);
      alert("Integrity Violation: " + ((err as any).response?.data?.error || "Transfer Failed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
    }
  });

  return (
    <div style={styles.container}>
      {/* HEADER & INTELLIGENCE */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>NexusFlow <span style={styles.badge}>v1.0 Heatmap</span></h1>
          {stats && (
            <div style={styles.intelStats}>
              <span>Total Network: <strong>{stats.total_network_stock}</strong></span>
              <span>Active Hubs: <strong>{stats.active_hubs}</strong></span>
            </div>
          )}
        </div>

        {/* SEARCH BAR (Postgres tsvector) */}
        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search SKUs or Products (PostgreSQL Index)..." 
            style={styles.searchInput}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div style={styles.searchResults}>
              {searchResults.map((p: any) => (
                <div key={p.id} style={styles.searchItem}>{p.name} — <small>{p.sku}</small></div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* HEATMAP GRID */}
      <div style={styles.grid}>
        {inventory.map((item: any) => {
          const saturation = (item.quantity / CAPACITY_LIMIT) * 100;
          const heatColor = saturation > 80 ? '#ff4d4f' : saturation > 40 ? '#faad14' : '#52c41a';

          return (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.warehouseTitle}>Warehouse {item.warehouse_id}</h3>
                <div style={{ ...styles.statusDot, backgroundColor: heatColor }} />
              </div>

              {/* Visual Heatmap Bar */}
              <div style={styles.heatTrack}>
                <div style={{ ...styles.heatFill, width: `${Math.min(saturation, 100)}%`, backgroundColor: heatColor }} />
              </div>

              <div style={styles.dataRow}>
                <span style={styles.quantityDisplay}>{item.quantity}</span>
                <span style={styles.capacityLabel}>/ {CAPACITY_LIMIT} Units</span>
              </div>

              {item.warehouse_id === 1 && (
                <button 
                  onClick={() => mutation.mutate({ product_id: 1, from_warehouse_id: 1, to_warehouse_id: 2, amount: 50 })}
                  disabled={mutation.isPending}
                  style={mutation.isPending ? styles.buttonDisabled : styles.button}
                >
                  {mutation.isPending ? "Syncing Redis..." : "Transfer 50 to Mombasa →"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '40px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { marginBottom: '40px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, color: '#1a1a1a', fontSize: '24px' },
  badge: { fontSize: '10px', background: '#007bff', color: '#fff', padding: '4px 8px', borderRadius: '4px', verticalAlign: 'middle' },
  intelStats: { display: 'flex', gap: '20px', fontSize: '14px', color: '#666' },
  searchContainer: { position: 'relative', maxWidth: '500px' },
  searchInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
  searchResults: { position: 'absolute', top: '50px', width: '100%', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 10, padding: '10px' },
  searchItem: { padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' },
  card: { background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  warehouseTitle: { margin: 0, fontSize: '18px', color: '#444' },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%' },
  heatTrack: { width: '100%', height: '6px', background: '#eee', borderRadius: '3px', margin: '20px 0', overflow: 'hidden' },
  heatFill: { height: '100%', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' },
  dataRow: { marginBottom: '20px' },
  quantityDisplay: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' },
  capacityLabel: { color: '#999', marginLeft: '8px' },
  button: { width: '100%', padding: '14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  buttonDisabled: { width: '100%', padding: '14px', background: '#ccc', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'not-allowed' }
};

export default App;

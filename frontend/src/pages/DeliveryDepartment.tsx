import { useState, useEffect } from 'react';
import api from '../api/api';

export default function DeliveryDepartment() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders');
        // Sort by dueDate ascending (soonest first)
        const sorted = (res.data ?? []).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setOrders(sorted);
        setError(null);
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || e.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, Arial', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Delivery Department</h2>

      {loading && <div>Loading deliveries…</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!loading && orders && (
        <div>
          {orders.map((order: any) => (
            <div key={order.id} style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                {order.items.filter((item: any) => (item.quantity ?? 0) > 0).map((item: any, idx: number) => (
                  <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <div>Size: {item.size?.name ?? 'N/A'}</div>
                      <div>Fabric: {item.fabric?.name ?? 'N/A'}</div>
                      <div>Color: {item.color?.name ?? 'N/A'}</div>
                      <div>Quantity: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && (!orders || orders.length === 0) && (
        <div style={{ color: '#666', fontSize: '0.95rem' }}>No deliveries found.</div>
      )}
    </div>
  );
}

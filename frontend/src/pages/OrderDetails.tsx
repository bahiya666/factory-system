import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data ?? null);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return (
    <div style={{ padding: 20 }}>
      <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
      <button className="btn small" onClick={fetchOrder}>Retry</button>
    </div>
  );
  if (!order) return <div style={{ padding: 20 }}>No order found.</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, Arial', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Order #{order.id}</h1>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        {order.items.map((item: any, idx: number) => (
          <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 4 }}>
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
  );
}

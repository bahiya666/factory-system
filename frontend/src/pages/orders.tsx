import { useEffect, useState } from 'react';
import api from '../api/api';
import OrderForm from './OrderForm';

export default function Orders() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showOrderCreate, setShowOrderCreate] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data ?? []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: number) => {
    const ok = window.confirm(`Delete order #${id}? This cannot be undone.`);
    if (!ok) return;
    setDeletingId(id);
    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) => (prev ? prev.filter((o) => o.id !== id) : prev));
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || `Failed to delete order #${id}`);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, Arial', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ marginTop: 0, marginBottom: 0 }}>Orders</h1>
        <button className="btn" onClick={() => setShowOrderCreate(true)}>Create Order</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && (
        <div style={{ color: "red", marginBottom: 8 }}>
          {error}
          <div>
            <button className="btn small" onClick={fetchOrders} style={{ marginTop: 8 }}>Retry</button>
          </div>
        </div>
      )}
      {!loading && orders && (
        <div>
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <button
                    className="btn danger small"
                    onClick={() => deleteOrder(order.id)}
                    disabled={deletingId === order.id}
                    aria-label={`Delete order #${order.id}`}
                  >
                    {deletingId === order.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                {order.items.filter((item: any) => (item.quantity ?? 0) > 0).map((item: any, idx: number) => (
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
          ))}
        </div>
      )}

      {showOrderCreate && (
        <div className="modal-backdrop" onClick={() => setShowOrderCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <OrderForm
              onCreated={() => {
                setShowOrderCreate(false);
                fetchOrders();
              }}
              onCancel={() => setShowOrderCreate(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

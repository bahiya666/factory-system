import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/api';

export default function MaterialOrderSlip() {
  const { dept, id: orderId } = useParams<{ dept?: string; id?: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [slip, setSlip] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !dept) return;
    setLoading(true);
    Promise.all([
      api.get(`/orders/${orderId}`),
      api.get(`/departments/${dept === 'MATERIALS' ? 'fabric' : dept.toLowerCase()}/cutting-slips/${orderId}`)
    ])
      .then(([orderRes, slipRes]) => {
        setOrder(orderRes.data);
        setSlip(slipRes.data);
        setError(null);
      })
      .catch((err: any) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || 'Failed to load');
      })
      .finally(() => setLoading(false));
  }, [orderId, dept]);

  const mmToMeters = (mm?: number) => {
    if (!mm && mm !== 0) return '';
    const m = (mm / 1000);
    return `${m.toFixed(3)} m`;
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!order || !slip) return <div>No data</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, Arial', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <button className="btn secondary" onClick={() => navigate(`/department/${dept}`)}>← Back</button>
      </div>
      <h2 style={{ marginTop: 0 }}>Order #{order.id} – {dept} Cutting Slip</h2>
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: 24 }}>
        Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
      </div>

      {/* Full cutting slip - all products together */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Full Cutting Slip</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {slip.pieces.map((p: any, idx: number) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.material}{p.note ? ` (${p.note})` : ''}</div>
              <div style={{ fontSize: '0.9rem', color: '#444' }}>
                {(p.width > 0 && p.height > 0) ? (
                  <>
                    <div>Width: {mmToMeters(p.width)}</div>
                    <div>Height: {mmToMeters(p.height)}</div>
                  </>
                ) : null}
                <div>Quantity: {p.quantity}</div>
                {p.color ? <div>Color: {p.color}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
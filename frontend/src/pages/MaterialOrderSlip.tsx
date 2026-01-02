import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

export default function MaterialOrderSlip() {
  const { dept, id } = useParams<{ dept: string; id: string }>();
  const orderId = (id || '').trim();

  const [order, setOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [slip, setSlip] = useState<any | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slipEndpoint = useMemo(() => {
    if (!orderId) return '';
    // Department MATERIALS maps to backend 'fabric' slips route previously implemented
    return `/departments/fabric/cutting-slips/${encodeURIComponent(orderId)}`;
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoadingOrder(true);
      try {
        const res = await api.get(`/orders/${encodeURIComponent(orderId)}`);
        setOrder(res.data ?? null);
        setError(null);
      } catch (e: any) {
        console.error(e);
        setOrder(null);
        setError(e?.response?.data?.message || e.message || 'Failed to load order');
      } finally {
        setLoadingOrder(false);
      }
    })();
  }, [orderId]);

  useEffect(() => {
    if (!slipEndpoint) return;
    (async () => {
      setLoadingSlip(true);
      try {
        const res = await api.get(slipEndpoint);
        setSlip(res.data ?? null);
        setError(null);
      } catch (e: any) {
        console.error(e);
        setSlip(null);
        setError(e?.response?.data?.message || e.message || 'Failed to load cutting slip');
      } finally {
        setLoadingSlip(false);
      }
    })();
  }, [slipEndpoint]);

  const mmToMeters = (mm?: number) => {
    if (!mm && mm !== 0) return '';
    const m = mm / 1000;
    return `${m.toFixed(3)} m`;
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, Arial', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{dept} Department — Order #{orderId}</h2>
        <Link className="btn secondary" to={`/department/${dept}`}>BACK</Link>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ marginBottom: 16 }}>
        {loadingOrder ? (
          <div>Loading order…</div>
        ) : order ? (
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
              {order.items.filter((it: any) => (it.quantity ?? 0) > 0).map((it: any, idx: number) => (
                <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{it.product?.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <div>Size: {it.size?.name ?? 'N/A'}</div>
                    <div>Fabric: {it.fabric?.name ?? 'N/A'}</div>
                    <div>Color: {it.color?.name ?? 'N/A'}</div>
                    <div>Quantity: {it.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        {loadingSlip ? (
          <div>Loading cutting slip…</div>
        ) : slip ? (
          <div>
            <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: 8 }}>
              Read-only. Department: {slip.department} | Type: {slip.type}
              {slip.scope?.orderId ? (
                <>
                  {' '}| Order #: {slip.scope.orderId}
                  {slip.scope?.dueDate ? (
                    <> | Due: {new Date(slip.scope.dueDate).toLocaleString()}</>
                  ) : null}
                </>
              ) : null}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
              {slip.pieces.map((p: any, i: number) => (
                <div key={i} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.material}{p.note ? ` (${p.note})` : ''}</div>
                  <div style={{ fontSize: '0.9rem', color: '#444' }}>
                    <div>Width: {mmToMeters(p.width)}</div>
                    <div>Height: {mmToMeters(p.height)}</div>
                    <div>Quantity: {p.quantity}</div>
                    {p.color ? <div>Color: {p.color}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

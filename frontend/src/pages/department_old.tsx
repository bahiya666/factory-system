import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';

export default function DepartmentPage() {
  const { dept } = useParams<{ dept: string }>();
  const { user } = useAuth();

  if (!dept) return <div>Invalid department</div>;

  if (user?.role === 'DEPARTMENT' && user.department && user.department !== dept) {
    return <Navigate to={`/department/${user.department}`} replace />;
  }

function FoamCuttingSlip() {
  const { dept } = useParams<{ dept: string }>();
  const navigate = useNavigate();
  const [orderIdFilter, setOrderIdFilter] = useState<string>('');
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const id = orderIdFilter.trim();
    return id ? `/departments/foam/cutting-slips/${encodeURIComponent(id)}` : '/departments/foam/cutting-slips';
  }, [orderIdFilter]);

  const mmToMeters = (mm?: number) => {
    if (!mm && mm !== 0) return '';
    const m = (mm / 1000);
    return `${m.toFixed(3)} m`;
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get('/orders');
        setOrders(res.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    const id = orderIdFilter.trim();
    setData(null);
    if (id) {
      (async () => {
        setLoadingOrder(true);
        try {
          const res = await api.get(`/orders/${encodeURIComponent(id)}`);
          setOrderDetails(res.data ?? null);
          setError(null);
        } catch (err: any) {
          console.error(err);
          setOrderDetails(null);
          setError(err?.response?.data?.message || err.message || 'Failed to load order');
        } finally {
          setLoadingOrder(false);
        }
      })();
    } else {
      setOrderDetails(null);
    }
  }, [endpoint]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSlip = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      setData(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to load cutting slip');
    } finally {
      setLoading(false);
    }
  };
  // NOTE: fetchSlip is currently unused; kept for potential future use

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          className="form-input"
          style={{ maxWidth: 180 }}
          placeholder="Filter by Order ID"
          value={orderIdFilter}
          onChange={(e) => setOrderIdFilter(e.target.value)}
        />
        {orderIdFilter.trim() && (
          <button
            className="btn small"
            onClick={() => navigate(`/department/${dept}/orders/${encodeURIComponent(orderIdFilter.trim())}`)}
          >Open</button>
        )}
      </div>

      {loading && <div>Loading cutting slip…</div>}
      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {error}
        </div>
      )}

      {orderIdFilter.trim() && (
        <div style={{ marginBottom: 16 }}>
          {loadingOrder && <div>Loading order…</div>}
          {orderDetails && (
            <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Order #{orderDetails.id}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Due: {new Date(orderDetails.dueDate).toLocaleString()} | Created: {new Date(orderDetails.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>
                {orderDetails.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <div>Size: {item.size?.name ?? 'N/A'}</div>
                      <div>Quantity: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <button className="btn" onClick={() => navigate(`/department/${dept}/orders/${orderDetails.id}`)}>Show Cutting Slip</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!orderIdFilter.trim() && (
        <div style={{ marginBottom: 16 }}>
          {loadingOrders && <div>Loading orders…</div>}
          {!loadingOrders && orders && (
            <div>
              {orders.map((order: any) => (
                <div key={order.id} style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
                      </div>
                      <button className="btn small" onClick={() => navigate(`/department/${dept}/orders/${order.id}`)}>Show Cutting Slip</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                    {order.items.filter((item: any) => (item.quantity ?? 0) > 0).map((item: any, idx: number) => (
                      <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{item.product?.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          <div>Size: {item.size?.name ?? 'N/A'}</div>
                          <div>Quantity: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data && (
        <div>
          <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: 8 }}>
            Read-only. Department: {data.department} | Type: {data.type}
            {data.scope?.orderId ? (
              <>
                {' '}| Order #: {data.scope.orderId}
                {data.scope?.dueDate ? (
                  <> | Due: {new Date(data.scope.dueDate).toLocaleString()}</>
                ) : null}
              </>
            ) : null}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {data.pieces.map((p: any, idx: number) => (
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WoodCuttingSlip() {
  const { dept } = useParams<{ dept: string }>();
  const navigate = useNavigate();
  const [orderIdFilter, setOrderIdFilter] = useState<string>('');
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const id = orderIdFilter.trim();
    return id ? `/departments/wood/cutting-slips/${encodeURIComponent(id)}` : '/departments/wood/cutting-slips';
  }, [orderIdFilter]);

  const mmToMeters = (mm?: number) => {
    if (!mm && mm !== 0) return '';
    const m = (mm / 1000);
    return `${m.toFixed(3)} m`;
  };

  useEffect(() => {
    // Load all orders list for Wood page
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get('/orders');
        setOrders(res.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    // If filtering by order, fetch full order first and wait for user to request slip
    const id = orderIdFilter.trim();
    setData(null);
    if (id) {
      (async () => {
        setLoadingOrder(true);
        try {
          const res = await api.get(`/orders/${encodeURIComponent(id)}`);
          setOrderDetails(res.data ?? null);
          setError(null);
        } catch (err: any) {
          console.error(err);
          setOrderDetails(null);
          setError(err?.response?.data?.message || err.message || 'Failed to load order');
        } finally {
          setLoadingOrder(false);
        }
      })();
    } else {
      setOrderDetails(null);
    }
  }, [endpoint]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSlip = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      setData(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to load cutting slip');
    } finally {
      setLoading(false);
    }
  };
  // NOTE: fetchSlip is currently unused; kept for potential future use

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          className="form-input"
          style={{ maxWidth: 180 }}
          placeholder="Filter by Order ID"
          value={orderIdFilter}
          onChange={(e) => setOrderIdFilter(e.target.value)}
        />
        {orderIdFilter.trim() && (
          <button
            className="btn small"
            onClick={() => navigate(`/department/${dept}/orders/${encodeURIComponent(orderIdFilter.trim())}`)}
          >Open</button>
        )}
      </div>

      {loading && <div>Loading cutting slip…</div>}
      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {error}
        </div>
      )}

      {orderIdFilter.trim() && (
        <div style={{ marginBottom: 16 }}>
          {loadingOrder && <div>Loading order…</div>}
          {orderDetails && (
            <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Order #{orderDetails.id}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Due: {new Date(orderDetails.dueDate).toLocaleString()} | Created: {new Date(orderDetails.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>
                {orderDetails.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <div>Size: {item.size?.name ?? 'N/A'}</div>
                      <div>Quantity: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <button className="btn" onClick={() => navigate(`/department/${dept}/orders/${orderDetails.id}`)}>Show Cutting Slip</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!orderIdFilter.trim() && (
        <div style={{ marginBottom: 16 }}>
          {loadingOrders && <div>Loading orders…</div>}
          {!loadingOrders && orders && (
            <div>
              {orders.map((order: any) => (
                <div key={order.id} style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
                      </div>
                      <button className="btn small" onClick={() => navigate(`/department/${dept}/orders/${order.id}`)}>Show Cutting Slip</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                    {order.items.filter((item: any) => (item.quantity ?? 0) > 0).map((item: any, idx: number) => (
                      <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{item.product?.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          <div>Size: {item.size?.name ?? 'N/A'}</div>
                          <div>Quantity: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data && (
        <div>
          <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: 8 }}>
            Read-only. Department: {data.department} | Type: {data.type}
            {data.scope?.orderId ? (
              <>
                {' '}| Order #: {data.scope.orderId}
                {data.scope?.dueDate ? (
                  <> | Due: {new Date(data.scope.dueDate).toLocaleString()}</>
                ) : null}
              </>
            ) : null}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {data.pieces.map((p: any, idx: number) => (
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

      ) : dept === 'WOOD' ? (
        <WoodCuttingSlip />
      ) : dept === 'FOAM' ? (
        <FoamCuttingSlip />
      ) : (
        <div style={{ marginTop: 12 }}>No department-specific view yet.</div>
      )}
    </div>
  );
}

function FabricCuttingSlip() {
  const { dept } = useParams<{ dept: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderIdFilter, setOrderIdFilter] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [showSlip, setShowSlip] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const endpoint = useMemo(() => {
    const id = orderIdFilter.trim();
    return id ? `/departments/fabric/cutting-slips/${encodeURIComponent(id)}` : '/departments/fabric/cutting-slips';
  }, [orderIdFilter]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSlip = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      setData(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to load cutting slip');
    } finally {
      setLoading(false);
    }
  };
  // NOTE: fetchSlip is currently unused; kept for potential future use

  useEffect(() => {
    // Load all orders list for Materials page
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get('/orders');
        setOrders(res.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    // If filtering by order, fetch full order first and wait for user to request slip
    const id = orderIdFilter.trim();
    setData(null);
    setShowSlip(false);
    if (id) {
      (async () => {
        setLoadingOrder(true);
        try {
          const res = await api.get(`/orders/${encodeURIComponent(id)}`);
          setOrderDetails(res.data ?? null);
          setError(null);
        } catch (err: any) {
          console.error(err);
          setOrderDetails(null);
          setError(err?.response?.data?.message || err.message || 'Failed to load order');
        } finally {
          setLoadingOrder(false);
        }
      })();
    } else {
      // No order selected: clear state and do not fetch aggregate slips by default
      setOrderDetails(null);
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const mmToMeters = (mm?: number) => {
    if (!mm && mm !== 0) return '';
    const m = (mm / 1000);
    return `${m.toFixed(3)} m`;
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          className="form-input"
          style={{ maxWidth: 180 }}
          placeholder="Filter by Order ID"
          value={orderIdFilter}
          onChange={(e) => setOrderIdFilter(e.target.value)}
        />
        {orderIdFilter.trim() && (
          <button
            className="btn small"
            onClick={() => navigate(`/department/${dept}/orders/${encodeURIComponent(orderIdFilter.trim())}`)}
          >Open</button>
        )}
      </div>

      {loading && <div>Loading cutting slip…</div>}
      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {error}
        </div>
      )}
      {/* When an Order ID is provided, show the order details and a button that opens the dedicated slip page */}
      {orderIdFilter.trim() && (
        <div style={{ marginBottom: 16 }}>
          {loadingOrder && <div>Loading order…</div>}
          {orderDetails && (
            <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Order #{orderDetails.id}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Due: {new Date(orderDetails.dueDate).toLocaleString()} | Created: {new Date(orderDetails.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>
                {orderDetails.items.map((item: any, idx: number) => (
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

              <div>
                <button
                  className="btn"
                  onClick={() => navigate(`/department/${dept}/orders/${orderDetails.id}`)}
                >Show Cutting Slip</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* When no Order ID is typed, show the list of all orders with a Show Cutting Slip button */}
      {!orderIdFilter.trim() && (
        <div style={{ marginBottom: 16 }}>
          {loadingOrders && <div>Loading orders…</div>}
          {!loadingOrders && orders && (
            <div>
              {orders.map((order: any) => (
                <div key={order.id} style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Due: {new Date(order.dueDate).toLocaleString()} | Created: {new Date(order.createdAt).toLocaleString()}
                      </div>
                      <button className="btn small" onClick={() => navigate(`/department/${dept}/orders/${order.id}`)}>Show Cutting Slip</button>
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
      {data && showSlip && (
        <div>
          <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: 8 }}>
            Department: {data.department} | Order #{orderDetails.id}
          </div>

          {(() => {
            const piecesByItem = data.pieces.reduce((acc: Record<string, any[]>, p) => {
              const key = p.orderItemId;
              if (!acc[key]) acc[key] = [];
              acc[key].push(p);
              return acc;
            }, {});

            return orderDetails.items.map((item: any) => {
              const itemPieces = piecesByItem[item.id] || [];

              if (itemPieces.length === 0) return null;

              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  {/* Product header */}
                  <h4 style={{ marginTop: 0, marginBottom: 12 }}>
                    {item.product?.name} – {item.size?.name} – Qty: {item.quantity}
                  </h4>

                  {/* Pieces grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {itemPieces.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid #eee',
                          padding: 12,
                          borderRadius: 6,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                          {p.material}
                          {p.note ? ` (${p.note})` : ''}
                        </div>

                        <div style={{ fontSize: '0.9rem', color: '#444' }}>
                          {p.width && <div>Width: {mmToMeters(p.width)}</div>}
                          {p.height && <div>Height: {mmToMeters(p.height)}</div>}
                          <div>Quantity: {p.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {!orderIdFilter.trim() && !loading && (!orders || orders.length === 0) && (
        <div style={{ color: '#666', fontSize: '0.95rem' }}>No orders found.</div>
      )}
    </div>
  );
}

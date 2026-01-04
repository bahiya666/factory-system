import { useEffect, useState } from 'react';
import api from '../api/api';

export default function OrderForm({ onCreated, onCancel }: { onCreated?: () => void; onCancel?: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<Record<number, Array<any>>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data || []);
        // initialize one box per product
        const initial: Record<number, Array<any>> = {};
        (res.data || []).forEach((p: any) => { initial[p.id] = [{ productId: p.id, sizeId: null, sizeName: (p.sizes||[]).map((s:any)=>s.name||s).join(', '), fabricId: null, fabricName: null, colorId: null, colorName: null, quantity: 0 }]; });
        setItems(initial);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const addAnother = (productId: number) => {
    setItems((prev) => ({ ...prev, [productId]: [...(prev[productId]||[]), { productId, sizeId: null, sizeName: null, fabricId: null, fabricName: null, colorId: null, colorName: null, quantity: 0 }] }));
  };

  const updateItem = (productId: number, idx: number, changes: Partial<any>) => {
    setItems((prev) => {
      const arr = [...(prev[productId]||[])];
      arr[idx] = { ...arr[idx], ...changes };
      return { ...prev, [productId]: arr };
    });
  };

  const submit = async (e?: any) => {
    if (e) e.preventDefault();
    try {
      const payloadItems: any[] = [];
      for (const pid of Object.keys(items)) {
        for (const it of items[Number(pid)]) {
          // prefer ids if available, otherwise names
          payloadItems.push({ productId: it.productId, sizeName: it.sizeName || undefined, fabricName: it.fabricName || undefined, colorName: it.colorName || undefined, quantity: Number(it.quantity ?? 0) });
        }
      }
      await api.post('/orders', { dueDate, items: payloadItems });
      onCreated && onCreated();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed');
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Due Date</label>
          <input className="form-input" type="datetime-local" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} required />
        </div>

        <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 8 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 12, width: 520, boxSizing: 'border-box' }}>
            <strong style={{ fontSize: '1.15rem', display: 'block', marginBottom: 8 }}>{p.name}</strong>
            {(items[p.id]||[]).map((it: any, idx: number) => (
              <div key={idx} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #f0f0f0' }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Size</label>
                  <select className="form-input" value={it.sizeName||''} onChange={(e)=>updateItem(p.id, idx, { sizeName: e.target.value })}>
                    <option value="">(none)</option>
                    {(p.sizes||[]).map((s: any)=>(<option key={s.id || s} value={s.name || s}>{s.name || s}</option>))}
                  </select>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Fabric</label>
                  <select className="form-input" value={it.fabricName||''} onChange={(e)=>updateItem(p.id, idx, { fabricName: e.target.value, colorName: null })}>
                    <option value="">(none)</option>
                    {(p.fabrics||[]).map((pf: any)=> {
                      const fname = pf.fabric?.name ?? pf.name;
                      return (<option key={fname} value={fname}>{fname}</option>);
                    })}
                  </select>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Color</label>
                  <select className="form-input" value={it.colorName||''} onChange={(e)=>updateItem(p.id, idx, { colorName: e.target.value })}>
                    <option value="">(none)</option>
                    {(() => {
                      const selectedFabric = ((p.fabrics||[]) as any[]).find((pf)=> (pf.fabric?.name ?? pf.name) === it.fabricName);
                      const colors = selectedFabric ? (selectedFabric.fabric?.colors ?? selectedFabric.colors ?? []) : [];
                      return colors.map((c:any)=>(<option key={c.id??c} value={c.name||c}>{c.name||c}</option>));
                    })()}
                  </select>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Quantity</label>
                  <input className="form-input" type="text" inputMode="numeric" pattern="[0-9]*" value={it.quantity || ''} onChange={(e)=>updateItem(p.id, idx, { quantity: e.target.value })} />
                </div>

              </div>
            ))}

            <div style={{ marginTop: 8 }}>
              <button type="button" className="btn small" onClick={()=>addAnother(p.id)}>Add another</button>
            </div>
          </div>
        ))}
        </div>

        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">Create Order</button>
          <button className="btn secondary" type="button" onClick={()=> onCancel && onCancel()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

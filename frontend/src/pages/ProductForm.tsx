import { useState } from 'react';
import api from '../api/api';

export default function ProductForm({
  product,
  onCreated,
  onCancel,
}: {
  product?: any;
  onCreated?: (p?: any) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [sizesText, setSizesText] = useState((product?.sizes || []).join(', '));
  const [fabricsText, setFabricsText] = useState(product ? JSON.stringify(product.fabrics, null, 2) : '{}');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: any) => {
    if (e) e.preventDefault();
    try {
      const sizes = sizesText.split(',').map((s) => s.trim()).filter(Boolean);
      const fabrics = JSON.parse(fabricsText || '{}');
      if (product) {
        await api.patch(`/products/${product.id}`, { name, sizes, fabrics });
        onCreated && onCreated();
      } else {
        await api.post('/products', { name, sizes, fabrics });
        onCreated && onCreated();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed');
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Sizes (comma separated)</label>
          <input className="form-input" value={sizesText} onChange={(e) => setSizesText(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Fabrics JSON (fabric → colors array)</label>
          <textarea className="form-input" rows={6} value={fabricsText} onChange={(e) => setFabricsText(e.target.value)} />
        </div>

        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">Save</button>
          <button className="btn secondary" type="button" onClick={() => onCancel && onCancel()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

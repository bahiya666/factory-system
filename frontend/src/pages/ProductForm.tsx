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
  const initialSizesText = () => {
    const s = product?.sizes || [];
    if (Array.isArray(s)) return s.map((x: any) => (x && typeof x === 'object' ? (x.name ?? '') : x)).filter(Boolean).join(', ');
    return String(s || '');
  };
  const [sizesText, setSizesText] = useState(initialSizesText());
  const computeInitialFabrics = () => {
    if (!product) return {};
    const f = (product as any).fabrics;
    if (Array.isArray(f)) {
      const map: Record<string, string[]> = {};
      for (const pf of f) {
        const fname = pf.fabric?.name ?? pf.name;
        const colors = (pf.fabric?.colors ?? pf.colors ?? []).map((c: any) => c.name ?? c);
        map[fname] = colors;
      }
      return map;
    }
    return f;
  };

  const [fabricsText, setFabricsText] = useState(product ? JSON.stringify(computeInitialFabrics(), null, 2) : '{}');
  const [error, setError] = useState<string | null>(null);

  // Helper to convert list of fabric/color strings into JSON format
  const listToJson = (list: string) => {
    const lines = list.split('\n').map(l => l.trim()).filter(Boolean);
    const result: Record<string, string[]> = {};
    let currentFabric: string | null = null;
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        // Fabric line: "Velvet:"
        currentFabric = line.slice(0, colonIdx).trim();
        const colorsPart = line.slice(colonIdx + 1).trim();
        const colors = colorsPart ? colorsPart.split(',').map(c => c.trim()).filter(Boolean) : [];
        result[currentFabric] = colors;
      } else if (currentFabric && line) {
        // Continuation line: just colors
        const colors = line.split(',').map(c => c.trim()).filter(Boolean);
        result[currentFabric].push(...colors);
      }
    }
    return result;
  };

  // Helper to convert JSON back to a readable list format
  const jsonToList = (obj: Record<string, string[]>) => {
    const lines: string[] = [];
    for (const [fabric, colors] of Object.entries(obj)) {
      lines.push(`${fabric}: ${colors.join(', ')}`);
    }
    return lines.join('\n');
  };

  const [useListMode, setUseListMode] = useState(true);
  const [listText, setListText] = useState(product ? jsonToList(computeInitialFabrics()) : '');

  const syncFromList = () => {
    try {
      const json = listToJson(listText);
      setFabricsText(JSON.stringify(json, null, 2));
      setError(null);
    } catch (e: any) {
      setError('Invalid list format');
    }
  };

  const syncFromJson = () => {
    try {
      const obj = JSON.parse(fabricsText);
      setListText(jsonToList(obj));
      setError(null);
    } catch (e: any) {
      setError('Invalid JSON format');
    }
  };

  // Initialize sync
  if (useListMode && !listText && fabricsText && fabricsText !== '{}') {
    syncFromJson();
  }
  if (!useListMode && fabricsText && fabricsText !== '{}' && !listText) {
    syncFromList();
  }

  const submit = async (e?: any) => {
    if (e) e.preventDefault();
    try {
      const sizes = sizesText.split(',').map((s) => s.trim()).filter(Boolean);
      const fabrics = useListMode ? listToJson(listText) : JSON.parse(fabricsText || '{}');
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
          <label style={{ display: 'block', marginBottom: 6 }}>
            Fabrics
            <button
              type="button"
              className="btn small"
              style={{ marginLeft: 8 }}
              onClick={() => {
                if (useListMode) syncFromList();
                else syncFromJson();
                setUseListMode(!useListMode);
              }}
            >
              {useListMode ? 'Switch to JSON' : 'Switch to List'}
            </button>
          </label>
          {useListMode ? (
            <textarea
              className="form-input"
              rows={6}
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              placeholder={`Velvet: Dark grey, Light grey, Black\nBOUCLE: Black, Dark grey`}
            />
          ) : (
            <textarea
              className="form-input"
              rows={6}
              value={fabricsText}
              onChange={(e) => setFabricsText(e.target.value)}
              placeholder='{"Velvet": ["Dark grey", "Light grey"], "BOUCLE": ["Black"]}'
            />
          )}
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

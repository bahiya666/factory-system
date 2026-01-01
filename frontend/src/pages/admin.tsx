import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/api';
import type { User as AppUser } from '../auth/AuthContext';
import Register from './register';
import { ALL_DEPARTMENTS } from '../constants/departments';
import ProductForm from './ProductForm';

export default function Admin() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState<any[] | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data as AppUser[]);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const changeDepartment = async (userId: number, department: string | null) => {
    try {
      await api.patch(`/users/${userId}`, { department });
      setUsers((prev) => prev?.map((u) => (u.id === userId ? { ...u, department } : u)) ?? null);
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((p) => p?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, Arial', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0, marginBottom: 6 }}>Admin Panel</h1>
      <div style={{ color: '#666', marginBottom: 12 }}>Signed in as: {user?.email}</div>

      {/* Managed Departments removed — show all departments at all times */}

      <section style={{ marginTop: 20 }}>
        <h3>Users</h3>
        {loading && <div>Loading...</div>}
        {error && (
          <div style={{ color: "red", marginBottom: 8 }}>
            {error}
            <div>
              <button className="btn small" onClick={fetchUsers} style={{ marginTop: 8 }}>Retry</button>
            </div>
          </div>
        )}
        {!loading && users && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Email</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Role</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Department</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{u.email}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{u.role}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>{u.department ?? "—"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f3f3" }}>
                    <select
                      className="form-input"
                      value={u.department ?? ""}
                      onChange={(e) => changeDepartment(u.id, e.target.value || null)}
                    >
                      <option value="">(none)</option>
                      {ALL_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>Products</h3>
        <div style={{ marginBottom: 12 }}>
          <button className="btn" onClick={() => { setEditingProduct(null); setShowCreate(true); }}>
            Create Product
          </button>
        </div>

        {!products && <div>Loading...</div>}
        {products && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Sizes</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Fabrics</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{p.name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{(p.sizes || []).join(', ')}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{Object.keys(p.fabrics || {}).join(', ')}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>
                    <button className="btn small" onClick={() => { setEditingProduct(p); setShowCreate(true); }}>Edit</button>
                    <button className="btn secondary small" onClick={() => deleteProduct(p.id)} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showCreate && (
          <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <ProductForm
                product={editingProduct ?? undefined}
                onCreated={() => { setShowCreate(false); fetchProducts(); }}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          </div>
        )}
      </section>

      {/* Logout kept in sidebar; removed from admin panel */}
    </div>
  );
}

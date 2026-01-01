import { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { ALL_DEPARTMENTS } from '../constants/departments';

export default function Register({ onCreated, onCancel }: { onCreated?: () => void; onCancel?: () => void } = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'DEPARTMENT'>('DEPARTMENT');
  const [department, setDepartment] = useState('WOOD');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await api.post('/users', {
        email,
        password,
        role,
        department: role === 'DEPARTMENT' ? department : undefined,
      });
      setError(null);
      if (onCreated) {
        onCreated();
      } else {
        alert('User created');
        navigate('/login');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      setError(String(msg));
    }
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Create User</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <input className="form-input" name="email" autoComplete="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input className="form-input" name="password" autoComplete="new-password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="form-input">
            <option value="DEPARTMENT">Department</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {role === 'DEPARTMENT' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="form-input">
              {ALL_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">Create</button>
          <button className="btn secondary" type="button" onClick={() => (onCancel ? onCancel() : navigate('/login'))}>Back to Login</button>
        </div>
      </form>
    </div>
  );
}

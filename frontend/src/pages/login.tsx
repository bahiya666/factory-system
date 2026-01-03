import { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      auth.login({ user: res.data.user, access_token: res.data.access_token });

      if (res.data.user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Login</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <input className="form-input" name="email" autoComplete="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input className="form-input" name="password" autoComplete="current-password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">Login</button>
          {/* <button className="btn secondary" type="button" onClick={() => navigate('/register')}>Register</button> */}
        </div>
      </form>
    </div>
  );
}

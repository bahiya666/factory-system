import { NavLink, useNavigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { DEPARTMENTS } from '../constants/departments';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const visible = user?.role === 'DEPARTMENT' && user.department ? [user.department] : DEPARTMENTS;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, Arial' }}>
      <aside
        style={{
          width: collapsed ? 64 : 240,
          padding: 12,
          borderRight: '1px solid #eee',
          boxSizing: 'border-box',
          background: '#fafafa',
          transition: 'width 180ms ease',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>{!collapsed && 'App'}</div>
          <button className="btn small" onClick={() => setCollapsed((c) => !c)} style={{ padding: 6 }} aria-label="Toggle sidebar">
            <div className="hamburger" aria-hidden>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <div style={{ color: '#666', marginBottom: 16, textAlign: collapsed ? 'center' : 'left' }}>{collapsed ? user?.email?.charAt(0) : user?.email}</div>

        <h4 style={{ margin: collapsed ? '8px 0' : '12px 0' }}>{!collapsed && 'Departments'}</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {visible.map((d) => (
            <li key={d} style={{ marginBottom: 8 }}>
              <NavLink to={`/department/${d}`} style={({ isActive }) => ({ color: isActive ? '#0066cc' : '#222', textDecoration: 'none', display: 'flex', gap: 8, alignItems: 'center' })}>
                {!collapsed && <span>{d}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {user?.role === 'ADMIN' && (
          <>
            <div style={{ marginTop: 12 }}>
              {!collapsed ? (
                <button className="btn" onClick={() => navigate('/admin')} style={{ width: '100%', marginBottom: 8 }}>Admin</button>
              ) : (
                <button className="btn small" onClick={() => navigate('/admin')} style={{ marginBottom: 8 }}>A</button>
              )}
            </div>
            <div>
              {!collapsed ? (
                <button className="btn" onClick={() => navigate('/orders')} style={{ width: '100%' }}>Orders</button>
              ) : (
                <button className="btn small" onClick={() => navigate('/orders')}>O</button>
              )}
            </div>
          </>
        )}

        <div style={{ position: 'absolute', bottom: 20, left: collapsed ? 8 : 20 }}>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}


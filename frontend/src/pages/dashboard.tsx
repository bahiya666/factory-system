import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Welcome{user?.email ? `, ${user.email}` : ""}</h1>
          <div style={{ color: "#666" }}>{user?.role} — {user?.department ?? "All"}</div>
        </div>
      </div>

      <section style={{ marginTop: 24 }}>
        <p>Select a department from the left to view its page.</p>
      </section>
    </div>
  );
}

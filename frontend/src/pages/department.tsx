import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function DepartmentPage() {
  const { dept } = useParams<{ dept: string }>();
  const { user } = useAuth();

  if (!dept) return <div>Invalid department</div>;

  if (user?.role === 'DEPARTMENT' && user.department && user.department !== dept) {
    return <Navigate to={`/department/${user.department}`} replace />;
  }

  return (
    <div>
      <h2>{dept} Department</h2>
      <p>Signed in as: {user?.email}</p>
      <p>Here you can add department-specific UI and data.</p>
    </div>
  );
}

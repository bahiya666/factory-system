import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/admin";
import RequireAuth from "./auth/requireAuth";
import MainLayout from "./layouts/MainLayout";
import DepartmentPage from "./pages/department";

export default function App() {
  return (
    <Routes>
      {/* Default (protected) home route */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </RequireAuth>
        }
      />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </RequireAuth>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          <RequireAuth allowedRoles={["ADMIN"]}>
            <MainLayout>
              <Admin />
            </MainLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/department/:dept"
        element={
          <RequireAuth>
            <MainLayout>
              <DepartmentPage />
            </MainLayout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

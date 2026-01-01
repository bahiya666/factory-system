import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

type Props = {
  children: ReactElement;
  allowedRoles?: Array<"ADMIN" | "DEPARTMENT">;
};

export default function RequireAuth({
  children,
  allowedRoles,
}: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type Props = { children: JSX.Element };

export function ProtectedRoute({ children }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading…
      </div>
    );
  }
  if (!user) {
    // preserve where the user was trying to go so login can bounce them back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

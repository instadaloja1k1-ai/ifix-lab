// @ts-nocheck
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children: e }) {
  let { session: t, loading: n, configError: r } = useAuth();
  return n ? (
    <div className="min-h-screen flex items-center justify-center bg-base-950">
      <div className="w-6 h-6 border-2 border-base-700 border-t-accent-400 rounded-full animate-spin" />
    </div>
  ) : !t && !r ? (
    <Navigate to="/login" replace />
  ) : (
    <>{e}</>
  );
}

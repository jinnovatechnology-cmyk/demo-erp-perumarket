// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredModule 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasModuleAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
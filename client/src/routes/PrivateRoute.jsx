import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Loader';

const roleHome = {
  borrower: '/borrower/dashboard',
  lender:   '/lender/dashboard',
  admin:    '/admin/dashboard',
};

// Requires login
export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Requires specific role(s)
export const RoleRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }
  return <Outlet />;
};

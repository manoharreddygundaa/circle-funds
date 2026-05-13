import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout }      from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PrivateRoute, RoleRoute } from './PrivateRoute';

import Login    from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import BorrowerDashboard from '../pages/borrower/BorrowerDashboard';
import ApplyLoan         from '../pages/borrower/ApplyLoan';
import MyLoans           from '../pages/borrower/MyLoans';
import Repayments        from '../pages/borrower/Repayments';

import LenderDashboard  from '../pages/lender/LenderDashboard';
import BrowseLoans      from '../pages/lender/BrowseLoans';
import MyInvestments    from '../pages/lender/MyInvestments';

import AdminDashboard   from '../pages/admin/AdminDashboard';
import AdminLoans       from '../pages/admin/AdminLoans';
import AdminUsers       from '../pages/admin/AdminUsers';

import Settings         from '../pages/Settings';
import NotFound         from '../pages/NotFound';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Borrower */}
          <Route element={<RoleRoute roles={['borrower']} />}>
            <Route path="/borrower/dashboard"  element={<BorrowerDashboard />} />
            <Route path="/borrower/apply"      element={<ApplyLoan />} />
            <Route path="/borrower/loans"      element={<MyLoans />} />
            <Route path="/borrower/repayments" element={<Repayments />} />
          </Route>

          {/* Lender */}
          <Route element={<RoleRoute roles={['lender']} />}>
            <Route path="/lender/dashboard"   element={<LenderDashboard />} />
            <Route path="/lender/browse"      element={<BrowseLoans />} />
            <Route path="/lender/investments" element={<MyInvestments />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/loans"     element={<AdminLoans />} />
            <Route path="/admin/users"     element={<AdminUsers />} />
          </Route>

          {/* Shared */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Links from './pages/Links';
import CreateLink from './pages/CreateLink';
import Trending from './pages/Trending';
import Suggestions from './pages/Suggestions';
import Statistics from './pages/Statistics';
import Earnings from './pages/Earnings';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Placeholder from './pages/Placeholder';
import BridgePage from './pages/BridgePage';
import UsersManagement from './pages/UsersManagement';
import Login from './pages/Login';
import { AuthProvider } from './components/auth/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route for the Link Shortener Bridge Page */}
          <Route path="/l/:code" element={<BridgePage />} />
          
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Dashboard Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="links" element={<Links />} />
            <Route path="links/create" element={<CreateLink />} />
            <Route path="trending" element={<Trending />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="billing" element={<Billing />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<UsersManagement />} />
            
            {/* Placeholders for other routes */}
            <Route path="ranking" element={<Placeholder title="Ranking y Premios" />} />
            <Route path="referrals" element={<Placeholder title="Referidos" />} />
            <Route path="resources" element={<Placeholder title="Recursos y Videos" />} />
            <Route path="facebook" element={<Placeholder title="Grupos de Facebook" />} />
            <Route path="info" element={<Placeholder title="Informaciones" />} />
            <Route path="terms" element={<Placeholder title="Términos y Condiciones" />} />
            <Route path="support" element={<Placeholder title="Soporte" />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

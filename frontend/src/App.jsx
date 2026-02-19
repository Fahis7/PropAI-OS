import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Pages & Components
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Unauthorized from "./components/Unauthorized";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import Properties from "./components/admin/Properties";
import PropertyDetails from "./components/admin/PropertyDetails";
import Tenants from "./components/admin/Tenants";
import Finance from "./components/admin/Finance";
import Maintenance from "./components/admin/Maintenance";
import Units from "./components/admin/Units";

// Tenant Components
import TenantDashboard from "./components/tenant/TenantDashboard";
import NewRequestForm from "./pages/tenant/NewRequestForm"; // 👈 ADDED
import MaintenanceList from "./pages/tenant/MaintenanceList"; // 👈 ADDED

// --- THE SECURITY GUARD ---
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access_token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role || "TENANT";

    if (allowedRoles && !allowedRoles.includes(userRole) && userRole !== "SUPER_ADMIN") {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}

function App() {
  const ADMIN_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER"];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* --- ADMIN ROUTES (With Sidebar Layout) --- */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/properties" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}><Properties /></ProtectedRoute>
          } />
          <Route path="/properties/:id" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}><PropertyDetails /></ProtectedRoute>
          } />
          <Route path="/tenants" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}><Tenants /></ProtectedRoute>
          } />
          <Route path="/finance" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}><Finance /></ProtectedRoute>
          } />
          <Route path="/maintenance" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}><Maintenance /></ProtectedRoute>
          } />
          <Route path="/units" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}><Units /></ProtectedRoute>
          } />
        </Route>

        {/* --- TENANT ROUTES (Usually Full Screen / No Admin Sidebar) --- */}
        <Route path="/tenant">
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={["TENANT"]}><TenantDashboard /></ProtectedRoute>
          } />
          <Route path="maintenance" element={
            <ProtectedRoute allowedRoles={["TENANT"]}><NewRequestForm /></ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute allowedRoles={["TENANT"]}><MaintenanceList /></ProtectedRoute>
          } />
        </Route>

        {/* Catch-all redirects */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
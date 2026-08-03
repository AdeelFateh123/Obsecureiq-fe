import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminManageUsers from "./pages/admin/AdminManageUsers";
import AdminGeneratedDocuments from "./pages/admin/AdminGeneratedDocuments";
import AdminProfileManagement from "./pages/admin/AdminProfileManagement";
import AnalystDashboard from "./pages/analyst/AnalystDashboard";
import AnalystGeneratedDocuments from "./pages/analyst/AnalystGeneratedDocuments";
import ClientDetail from "./pages/ClientDetail";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultDashboard = () => {
    if (!user) return "/login";
    return user.role === "Admin" ? "/admin/dashboard" : "/analyst/dashboard";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultDashboard()} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultDashboard()} replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={getDefaultDashboard()} replace /> : <Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute requiredRole="Admin"><AdminClients /></ProtectedRoute>} />
      <Route path="/admin/manage-users" element={<ProtectedRoute requiredRole="Admin"><AdminManageUsers /></ProtectedRoute>} />
      <Route path="/admin/generated-documents" element={<ProtectedRoute requiredRole="Admin"><AdminGeneratedDocuments /></ProtectedRoute>} />
      <Route path="/admin/profile-management" element={<ProtectedRoute requiredRole="Admin"><AdminProfileManagement /></ProtectedRoute>} />

      {/* Analyst Routes */}
      <Route path="/analyst/dashboard" element={<ProtectedRoute requiredRole="Analyst"><AnalystDashboard /></ProtectedRoute>} />
      <Route path="/analyst/client/:id" element={<ProtectedRoute requiredRole="Analyst"><ClientDetail /></ProtectedRoute>} />
      <Route path="/analyst/generated-documents" element={<ProtectedRoute requiredRole="Analyst"><AnalystGeneratedDocuments /></ProtectedRoute>} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

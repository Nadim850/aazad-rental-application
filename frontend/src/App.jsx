import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import PublicLayout from "./layouts/PublicLayout";
import LandingPage from "./pages/public/LandingPage";
import SeatSelectionMap from "./pages/public/SeatSelectionMap";
import PricingPage from "./pages/public/PricingPage";
import ContactPage from "./pages/public/ContactPage";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import UserDashboardLayout from "./layouts/UserDashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminWorkspacesPage from "./pages/admin/AdminWorkspacesPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import LibraryServices from "./pages/public/LibraryServices";
import DedicatedServices from "./pages/public/DedicatedServices";
import StartupServices from "./pages/public/StartupServices";
import PaymentPage from "./pages/public/PaymentPage";
import ReceiptPage from "./pages/public/ReceiptPage";

import UserSettingsPage from "./pages/dashboard/UserSettingsPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/book" element={<SeatSelectionMap />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/library" element={<LibraryServices />} />
            <Route path="/dedicated" element={<DedicatedServices />} />
            <Route path="/startup" element={<StartupServices />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/receipt/:id" element={<ReceiptPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard/*" element={<UserDashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="settings" element={<UserSettingsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="workspaces" element={<AdminWorkspacesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

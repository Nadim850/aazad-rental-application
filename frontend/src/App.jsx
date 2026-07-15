import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import PublicLayout from "./layouts/PublicLayout";
import LandingPage from "./pages/public/LandingPage";
import SeatSelectionMap from "./pages/public/SeatSelectionMap";
import PricingPage from "./pages/public/PricingPage";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import UserDashboardLayout from "./layouts/UserDashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminWorkspacesPage from "./pages/admin/AdminWorkspacesPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import LibraryServices from "./pages/public/LibraryServices";
import CoworkingServices from "./pages/public/CoworkingServices";
import StartupServices from "./pages/public/StartupServices";
import PaymentPage from "./pages/public/PaymentPage";

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
            <Route path="/library" element={<LibraryServices />} />
            <Route path="/coworking" element={<CoworkingServices />} />
            <Route path="/startup" element={<StartupServices />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<UserDashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="settings" element={<UserSettingsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route index element={<AdminPlansPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="workspaces" element={<AdminWorkspacesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

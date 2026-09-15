import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthModalProvider } from "./contexts/AuthModalContext";
import PublicLayout from "./layouts/PublicLayout";
import LandingPage from "./pages/public/LandingPage";
import PricingPage from "./pages/public/PricingPage";
import ContactPage from "./pages/public/ContactPage";
import UserDashboardLayout from "./layouts/UserDashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import InvoicesPage from "./pages/dashboard/InvoicesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminWorkspacesPage from "./pages/admin/AdminWorkspacesPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import LibraryServices from "./pages/public/LibraryServices";
import CoworkingServices from "./pages/public/CoworkingServices";
import StartupServices from "./pages/public/StartupServices";
import LibraryFacilityDetails from "./pages/public/LibraryFacilityDetails";
import CoworkingFacilityDetails from "./pages/public/CoworkingFacilityDetails";
import StartupFacilityDetails from "./pages/public/StartupFacilityDetails";
import PaymentPage from "./pages/public/PaymentPage";
import ReceiptPage from "./pages/public/ReceiptPage";
import AdminContactQueriesPage from "./pages/admin/AdminContactQueriesPage";
import UserSettingsPage from "./pages/dashboard/UserSettingsPage";
import AuthModal from "./components/auth/AuthModal";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider>
      <AuthModalProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <AuthModal />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/library" element={<LibraryServices />} />
              <Route path="/coworking" element={<CoworkingServices />} />
              <Route
                path="/coworking/details"
                element={<CoworkingFacilityDetails />}
              />
              <Route path="/startup" element={<StartupServices />} />
              <Route
                path="/pricing/library"
                element={<Navigate to="/pricing?plan=library" replace />}
              />
              <Route
                path="/pricing/coworking"
                element={<Navigate to="/pricing?plan=dedicated" replace />}
              />
              <Route
                path="/pricing/startup"
                element={<Navigate to="/pricing?plan=conference" replace />}
              />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/receipt/:id" element={<ReceiptPage />} />
            </Route>

            {/* Dashboard Routes */}
            <Route path="/dashboard/*" element={<UserDashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="settings" element={<UserSettingsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route index element={<Navigate to="library/users" replace />} />

              {/* Library Management */}
              <Route
                path="library/users"
                element={<AdminUsersPage category="library" />}
              />
              <Route
                path="library/plans"
                element={<AdminPlansPage category="library" />}
              />
              <Route
                path="library/workspaces"
                element={<AdminWorkspacesPage category="library" />}
              />

              {/* Coworking Management */}
              <Route
                path="coworking/users"
                element={<AdminUsersPage category="coworking" />}
              />
              <Route
                path="coworking/plans"
                element={<AdminPlansPage category="coworking" />}
              />
              <Route
                path="coworking/workspaces"
                element={<AdminWorkspacesPage category="coworking" />}
              />

              {/* System */}
              <Route
                path="contact-queries"
                element={<AdminContactQueriesPage />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthModalProvider>
    </ThemeProvider>
  );
}

export default App;

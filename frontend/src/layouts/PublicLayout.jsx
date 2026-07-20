import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun, BookOpen } from "lucide-react";
import { Button } from "../components/ui/Button";
import NotificationBell from "../components/layout/NotificationBell";

import { apiFetch } from "../lib/api";

export default function PublicLayout() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check auth state whenever location changes
  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(!!token);
    setIsDropdownOpen(false); // Close dropdown on navigation

    if (token) {
      apiFetch("http://localhost:8000/api/accounts/me/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Not authenticated");
        })
        .then((data) => setUser(data))
        .catch(() => {
          // Handle expired token or error
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          setIsLoggedIn(false);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-main transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-border-main bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl text-white">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Aazad Rental
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              to="/"
              className="text-text-main/70 hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              to="/library"
              className="text-text-main/70 hover:text-primary transition-colors"
            >
              Library
            </Link>
            <Link
              to="/coworking"
              className="text-text-main/70 hover:text-primary transition-colors"
            >
              Coworking
            </Link>
            <Link
              to="/startup"
              className="text-text-main/70 hover:text-primary transition-colors"
            >
              Startup
            </Link>
            <Link
              to="/pricing"
              className="text-text-main/70 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="text-text-main/70 hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-border-main/50 transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden md:flex gap-2 relative">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 relative">
                  <NotificationBell />
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-border-main/50 p-1.5 pr-3 rounded-full transition-colors border border-border-main/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {user?.first_name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[13px] font-semibold leading-tight max-w-[100px] truncate">
                        {user?.first_name || "User"}
                      </span>
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-surface border border-border-main overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate(
                                user?.is_staff ? "/admin" : "/dashboard",
                              );
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-border-main/50 transition-colors font-medium"
                          >
                            {user?.is_staff ? "Admin Panel" : "My Dashboard"}
                          </button>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleLogout();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    Get Started
                  </Button>

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-surface border border-border-main overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/auth/login");
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-border-main/50 transition-colors font-medium"
                          >
                            Log In
                          </button>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/auth/signup");
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-border-main/50 transition-colors font-medium"
                          >
                            Sign Up
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border-main bg-surface py-12 mt-auto">
        <div className="container mx-auto px-4 text-center text-text-main/60">
          <p>© 2026 Aazad Rental. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

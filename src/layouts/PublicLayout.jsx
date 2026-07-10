import { Outlet, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun, BookOpen } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function PublicLayout() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-border-main/50 transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth/login")}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/pricing")}
              >
                Get Started
              </Button>
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

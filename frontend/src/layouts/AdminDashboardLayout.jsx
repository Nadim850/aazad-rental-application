import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  CreditCard,
  Box,
  Search,
  Bell,
  Command,
  Sun,
  Moon,
  Tags,
  LogOut,
  MessageSquare,
  Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";

import { apiFetch } from "../lib/api";
import { SearchProvider, useSearch } from "../contexts/SearchContext";

function AdminDashboardLayoutContent() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    apiFetch('http://localhost:8000/api/accounts/me/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data) {
        setUser(data);
        if (!data.is_staff) {
          navigate('/dashboard'); // Normal users shouldn't be in admin
        } else {
          setIsVerifying(false);
        }
      } else {
        navigate('/auth/login');
      }
    })
    .catch(() => navigate('/auth/login'));
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  const navigationGroups = [
    {
      title: "Library Management",
      links: [
        { name: "Users", to: "/admin/library/users", icon: Users },
        { name: "Plans", to: "/admin/library/plans", icon: Tags },
        { name: "Workspaces", to: "/admin/library/workspaces", icon: Box },
      ]
    },
    {
      title: "Coworking Management",
      links: [
        { name: "Users", to: "/admin/coworking/users", icon: Users },
        { name: "Plans", to: "/admin/coworking/plans", icon: Tags },
        { name: "Workspaces", to: "/admin/coworking/workspaces", icon: Box },
      ]
    },
    {
      title: "System",
      links: [
        { name: "Contact Queries", to: "/admin/contact-queries", icon: MessageSquare },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-main flex font-sans antialiased selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-main flex flex-col bg-surface">
        {/* Workspace selector */}
        <div className="h-14 flex items-center px-4 border-b border-border-main bg-black/5 dark:bg-white/5 transition-colors">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-xs font-bold text-white mr-3">
            A
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-sm font-medium truncate">Aazad Rental</h2>
            <p className="text-[11px] text-text-main/50">Admin Dashboard</p>
          </div>
        </div>



        {/* Navigation */}
        <div className="px-3 space-y-6 flex-1 overflow-y-auto mt-2">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-main/40 mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.links.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={item.to === "/admin"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-black/10 dark:bg-white/10 text-text-main"
                          : "text-text-main/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-main",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={16}
                          className={cn("opacity-70", {
                            "text-primary opacity-100": isActive,
                          })}
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-border-main">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{user?.first_name || 'Admin User'}</p>
              <p className="text-[11px] text-text-main/50 truncate">
                {user?.email || 'admin@aazad.com'}
              </p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-text-main/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Command bar / Top Nav */}
        <header className="h-14 border-b border-border-main flex items-center px-6 justify-between shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 text-text-main/50 max-w-sm w-full bg-black/5 dark:bg-white/[0.03] hover:bg-black/10 dark:hover:bg-white/[0.06] border border-border-main rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/50 transition-colors">
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search users, plans, workspaces..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-[13px] flex-1 bg-transparent border-none outline-none text-text-main placeholder:text-text-main/50"
            />
            <div className="flex items-center gap-1 text-[10px] font-medium tracking-widest bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
              <Command size={10} /> K
            </div>
          </div>

          <div className="flex items-center gap-4 text-text-main/60">
            <button
              onClick={toggleTheme}
              className="hover:text-text-main transition-colors p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="hover:text-text-main transition-colors p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardLayout() {
  return (
    <SearchProvider>
      <AdminDashboardLayoutContent />
    </SearchProvider>
  );
}

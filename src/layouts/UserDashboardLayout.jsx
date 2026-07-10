import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { BookOpen, LayoutDashboard, QrCode, CreditCard, Calendar, Settings, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

export default function UserDashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Library Pass', to: '/dashboard/library', icon: QrCode },
    { name: 'Bookings', to: '/dashboard/bookings', icon: Calendar },
    { name: 'Payments', to: '/dashboard/payments', icon: CreditCard },
    { name: 'Settings', to: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-border-main bg-surface transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b border-border-main">
           <div className="bg-primary p-1.5 rounded-lg text-white mr-3">
             <BookOpen size={20} />
           </div>
           <span className="text-xl font-bold tracking-tight text-text-main">Aazad</span>
        </div>
        
        <div className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-main/70 hover:bg-border-main/50 hover:text-text-main"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-border-main/30 rounded-xl p-4">
             <p className="text-sm font-medium mb-1">Pro Plan</p>
             <p className="text-xs text-text-main/70 mb-3">12 days remaining</p>
             <Button variant="outline" size="sm" className="w-full bg-surface">Renew Plan</Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border-main bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-border-main/50"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center ml-auto gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-border-main/50 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 rounded-full hover:bg-border-main/50 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary ml-2 border border-border-main cursor-pointer" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

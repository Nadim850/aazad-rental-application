import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect } from 'react';
import { 
  BarChart3, Users, CreditCard, Box, Settings, 
  Search, Bell, Plus, ChevronsUpDown, Command
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

export default function AdminDashboardLayout() {
  const { theme, toggleTheme } = useTheme();

  // Force dark mode for admin dashboard to mimic Linear's professional feel
  useEffect(() => {
    if (theme !== 'dark') toggleTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigation = [
    { name: 'Analytics', to: '/admin', icon: BarChart3 },
    { name: 'Users', to: '/admin/users', icon: Users },
    { name: 'Payments', to: '/admin/payments', icon: CreditCard },
    { name: 'Workspaces', to: '/admin/workspaces', icon: Box },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex font-sans antialiased selection:bg-primary/30">
      
      {/* Sidebar (Linear inspired) */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#141519]">
        {/* Workspace selector */}
        <div className="h-14 flex items-center px-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-xs font-bold text-white mr-3">
            A
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-sm font-medium truncate">Aazad Rental</h2>
            <p className="text-[11px] text-white/40">Premium Workspace</p>
          </div>
          <ChevronsUpDown size={14} className="text-white/40" />
        </div>

        {/* Create new action */}
        <div className="px-3 py-4">
           <Button variant="primary" size="sm" className="w-full justify-between px-3 h-9 bg-primary/90 hover:bg-primary text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]">
             <span className="flex items-center"><Plus size={16} className="mr-2" /> New Issue</span>
           </Button>
        </div>
        
        {/* Navigation */}
        <div className="px-3 space-y-0.5 flex-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={16} className={cn("opacity-70", { "text-primary opacity-100": item.name === 'Analytics' })} />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
             <div className="flex-1 min-w-0">
               <p className="text-[13px] font-medium truncate">Admin User</p>
               <p className="text-[11px] text-white/40 truncate">admin@aazad.com</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0F1115]">
        
        {/* Command bar / Top Nav */}
        <header className="h-14 border-b border-white/5 flex items-center px-6 justify-between shrink-0">
           {/* Search */}
           <div className="flex items-center gap-2 text-white/40 max-w-sm w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-md px-3 py-1.5 cursor-text transition-colors">
             <Search size={14} />
             <span className="text-[13px] flex-1">Search...</span>
             <div className="flex items-center gap-1 text-[10px] font-medium tracking-widest bg-white/10 px-1.5 py-0.5 rounded">
               <Command size={10} /> K
             </div>
           </div>

           <div className="flex items-center gap-4 text-white/60">
             <button className="hover:text-white transition-colors">
               <Bell size={16} />
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

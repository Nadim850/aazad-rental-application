import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { BookOpen, LayoutDashboard, QrCode, CreditCard, Calendar, Settings, Bell, Moon, Sun, Menu, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { apiFetch } from '../lib/api';

export default function UserDashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          navigate('/auth/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [userRes, dashboardRes] = await Promise.all([
          apiFetch('http://localhost:8000/api/accounts/me/', { headers }),
          apiFetch('http://localhost:8000/api/bookings/my-dashboard/', { headers })
        ]);

        if (userRes.ok && dashboardRes.ok) {
          const user = await userRes.json();
          const dashboard = await dashboardRes.json();
          setUserData(user);
          setDashboardData(dashboard);
        } else if (userRes.status === 401) {
          navigate('/auth/login');
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const navigation = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Settings', to: '/dashboard/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { active_subscription } = dashboardData || {};
  let daysRemaining = 0;
  let isNearExpire = false;
  if (active_subscription) {
    const end = new Date(active_subscription.end_time);
    const now = new Date();
    const diffTime = end - now;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isNearExpire = daysRemaining <= 7 && daysRemaining > 0;
  }

  const [showNotifications, setShowNotifications] = useState(false);
  const userName = userData?.first_name || userData?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-border-main bg-surface transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Link to="/" className="flex h-16 items-center px-6 border-b border-border-main hover:bg-border-main/20 transition-colors">
           <div className="bg-primary p-1.5 rounded-lg text-white mr-3">
             <BookOpen size={20} />
           </div>
           <div className="flex-1">
             <span className="text-xl font-bold tracking-tight text-text-main block">Aazad</span>
             <span className="text-[10px] text-text-main/50 font-medium">Return to Home</span>
           </div>
        </Link>
        
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
             <p className="text-sm font-medium mb-1">
               {active_subscription ? (active_subscription.workspace.workspace_type === 'library' ? 'Silent Reader' : 'Pro Plan') : 'No Plan'}
             </p>
             <p className={cn("text-xs mb-3", isNearExpire ? "text-error font-medium" : "text-text-main/70")}>
               {active_subscription ? `${daysRemaining} days remaining` : 'Get started today'}
             </p>
             <Button variant="outline" size="sm" className="w-full bg-surface" onClick={() => navigate('/pricing')}>
               {active_subscription ? 'Renew Plan' : 'View Plans'}
             </Button>
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

          <div className="flex items-center ml-auto gap-2 sm:gap-4 relative">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-border-main/50 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-border-main/50 transition-colors relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {isNearExpire && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error border border-surface animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-surface border border-border-main rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                    <div className="p-3 border-b border-border-main bg-black/5 dark:bg-white/5 font-semibold text-sm">
                      Notifications
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {isNearExpire ? (
                        <div className="p-4 border-b border-border-main/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/pricing')}>
                          <p className="text-sm font-medium text-error mb-1">Plan Expiring Soon!</p>
                          <p className="text-xs text-text-main/70">Your workspace plan expires in {daysRemaining} days. Click here to renew and keep your seat.</p>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-text-main/50 text-sm">
                          No new notifications.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border-main">
              <span className="text-sm font-medium hidden sm:block">{userName}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet context={{ userData, dashboardData }} />
        </main>
      </div>
    </div>
  );
}

import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { BookOpen, LayoutDashboard, QrCode, CreditCard, Calendar, Settings, Bell, Moon, Sun, Menu, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { apiFetch } from '../lib/api';
import NotificationBell from '../components/layout/NotificationBell';
import { Skeleton } from '../components/ui/Skeleton';

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

        if (userRes.ok) {
          const user = await userRes.json();
          setUserData(user);

          if (dashboardRes.ok) {
            const dashboard = await dashboardRes.json();
            setDashboardData(dashboard);
          } else if (dashboardRes.status === 401) {
            navigate('/auth/login');
            return;
          } else {
            console.error('Failed to load dashboard details:', dashboardRes.status);
            setDashboardData({ active_subscription: null, payment_history: [] });
          }
        } else if (userRes.status === 401) {
          navigate('/auth/login');
          return;
        } else {
          console.error('Failed to verify user session:', userRes.status);
          navigate('/auth/login');
          return;
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

  const [showNotifications, setShowNotifications] = useState(false);



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
              <NotificationBell />
            </div>
            
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border-main relative group">
              <span className="text-sm font-medium hidden sm:block">{userName}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 cursor-pointer">
                {userName.charAt(0).toUpperCase()}
              </div>

              {/* Profile Hover Card */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border-main rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b border-border-main/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/30 shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate">{userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : userName}</p>
                      <p className="text-xs text-text-main/70 truncate">{userData?.email}</p>
                      {userData?.phone_number && <p className="text-xs text-text-main/70 truncate">{userData.phone_number}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border-b border-border-main/50 bg-black/5 dark:bg-white/5">
                  <p className="text-[10px] font-bold text-text-main/50 uppercase tracking-wider mb-1.5">Current Plan</p>
                  {active_subscription ? (
                    <div>
                      <p className="text-sm font-medium">{active_subscription.workspace.name}</p>
                      <p className="text-xs text-text-main/70 capitalize mb-1">{active_subscription.workspace.workspace_type} Zone</p>
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">Active</Badge>
                    </div>
                  ) : (
                    <p className="text-xs text-text-main/70">No active plan</p>
                  )}
                </div>
                
                <div className="p-2 space-y-1">
                  <Link to="/dashboard/settings" className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-border-main/50 transition-colors">
                    <Settings className="w-4 h-4 mr-2 opacity-70" /> Settings
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('access');
                      localStorage.removeItem('refresh');
                      navigate('/auth/login');
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-error/10 hover:text-error transition-colors text-left"
                  >
                    <BookOpen className="w-4 h-4 mr-2 opacity-70" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {loading ? (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <Skeleton className="h-10 w-64 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : (
            <Outlet context={{ userData, dashboardData }} />
          )}
        </main>
      </div>
    </div>
  );
}

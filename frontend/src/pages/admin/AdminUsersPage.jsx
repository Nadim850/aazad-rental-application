import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChevronDown, ChevronUp, User, CreditCard, Calendar, Clock, Edit, ShieldBan, Trash2, Mail, Phone, Crown, Hash } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { Button } from '../../components/ui/Button';

import { apiFetch } from '../../lib/api';

export default function AdminUsersPage({ category = 'library' }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchQuery } = useSearch();
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await apiFetch('http://localhost:8000/api/bookings/admin/detailed-users/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleUser = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch(`http://localhost:8000/api/bookings/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setExpandedUser(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the user.");
    }
  };

  const getPlanName = (workspaceType) => {
    const types = {
      library: 'Library Pass',
      dedicated: 'Dedicated Desk',
      cabin: 'Private Cabin',
      startup: 'Startup Space'
    };
    return types[workspaceType] || 'Standard Plan';
  };

  const filteredUsers = users.filter(u => {
    const q = (searchQuery || '').toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone_number || '').toLowerCase();
    const activeSeat = (u.active_subscription?.workspace?.name || '').toLowerCase();
    const upcomingSeats = (u.upcoming_subscriptions || []).map(sub => (sub.workspace?.name || '').toLowerCase()).join(' ');

    const matchesSearch = fullName.includes(q) || 
           email.includes(q) || 
           phone.includes(q) || 
           activeSeat.includes(q) ||
           upcomingSeats.includes(q);

    // Filter by category
    const activeSub = u.active_subscription;
    const isLibraryUser = activeSub?.workspace?.workspace_type === 'library';
    const isCoworkingUser = activeSub && activeSub?.workspace?.workspace_type !== 'library';
    
    // An inactive user could be shown in both, or we can just show them if they have upcoming subs matching, 
    // or maybe just keep them visible in the "Inactive" section regardless, but to be strictly separated:
    // We will show them if they have any upcoming matching the category, OR if they have no subs at all.
    let matchesCategory = false;
    if (category === 'library') {
      matchesCategory = isLibraryUser || (!activeSub && (u.upcoming_subscriptions || []).some(sub => sub.workspace?.workspace_type === 'library')) || (!activeSub && (!u.upcoming_subscriptions || u.upcoming_subscriptions.length === 0));
    } else {
      matchesCategory = isCoworkingUser || (!activeSub && (u.upcoming_subscriptions || []).some(sub => sub.workspace?.workspace_type !== 'library')) || (!activeSub && (!u.upcoming_subscriptions || u.upcoming_subscriptions.length === 0));
    }

    return matchesSearch && matchesCategory;
  });

  const activeSubscribers = filteredUsers.filter(u => u.active_subscription);
  const inactiveUsers = filteredUsers.filter(u => !u.active_subscription);

  const ExpandedUserDetails = ({ user }) => (
    <div className="border-t border-border-main p-6 bg-black/5 dark:bg-white/[0.01] grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Left Column: Subscriptions */}
      <div className="space-y-6">
        {/* Active Sub (If Any) */}
        {user.active_subscription && (
          <div>
            <h4 className="flex items-center text-sm font-semibold text-text-main/80 mb-3 uppercase tracking-wider">
              <User size={14} className="mr-2" /> Active Subscription
            </h4>
            <div className="p-4 rounded-lg border border-border-main bg-surface">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{user.active_subscription.workspace.name}</p>
                  <p className="text-xs text-text-main/60 capitalize">{user.active_subscription.workspace.workspace_type} Zone</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="space-y-1 mt-4 text-xs text-text-main/70">
                <p>Started: <span className="font-medium text-text-main">{new Date(user.active_subscription.start_time).toLocaleDateString()}</span></p>
                <p>Expires: <span className="font-medium text-text-main">{new Date(user.active_subscription.end_time).toLocaleDateString()}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Subs */}
        {user.upcoming_subscriptions && user.upcoming_subscriptions.length > 0 && (
          <div>
            <h4 className="flex items-center text-sm font-semibold text-text-main/80 mb-3 uppercase tracking-wider">
              <Clock size={14} className="mr-2" /> Upcoming Subscription(s)
            </h4>
            <div className="space-y-3">
              {user.upcoming_subscriptions.map(sub => (
                <div key={sub.id} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm">Seat: {sub.workspace.name}</p>
                    <Badge variant="warning" className="text-[10px]">Upcoming</Badge>
                  </div>
                  <div className="text-xs text-text-main/70 space-y-0.5 mt-2">
                    <p>Purchased: {new Date(sub.created_at).toLocaleDateString()}</p>
                    <p>Starts on: <span className="font-medium text-text-main">{new Date(sub.start_time).toLocaleDateString()}</span></p>
                    <p>Expires on: {new Date(sub.end_time).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Payments & Actions */}
      <div className="space-y-6">
        {/* Actions */}
        <div>
           <h4 className="flex items-center text-sm font-semibold text-text-main/80 mb-3 uppercase tracking-wider">
              Quick Actions
           </h4>
           <div className="flex flex-wrap gap-2">
             <Button variant="outline" size="sm" className="h-8 text-xs">
               <Edit size={12} className="mr-1.5" /> Edit User
             </Button>
             <Button variant="outline" size="sm" className="h-8 text-xs text-error hover:bg-error/10 border-error/20 hover:border-error">
               <ShieldBan size={12} className="mr-1.5" /> Suspend
             </Button>
             <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)} className="h-8 text-xs text-red-500 hover:bg-red-500/10 border-red-500/20 hover:border-red-500">
               <Trash2 size={12} className="mr-1.5" /> Delete
             </Button>
           </div>
        </div>

        {/* Payment History */}
        <div>
          <h4 className="flex items-center text-sm font-semibold text-text-main/80 mb-3 uppercase tracking-wider">
            <CreditCard size={14} className="mr-2" /> Payment Details
          </h4>
          {user.payment_history && user.payment_history.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {user.payment_history.map(payment => (
                <div key={payment.id} className="p-3 rounded-lg border border-border-main bg-surface flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">INV-{1000 + payment.id}</p>
                    <p className="text-[11px] text-text-main/50 flex items-center mt-0.5">
                      <Calendar size={10} className="mr-1" /> {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{(payment.workspace.price_per_hour * 8 * 30).toFixed(0)}</p>
                    <Badge variant="success" className="text-[10px] px-1.5 py-0 mt-0.5">Paid</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-border-main text-center text-sm text-text-main/50">
              No payment history
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          {category === 'library' ? 'Library Users' : 'Coworking Users'}
        </h1>
        <p className="text-text-main/60">
          Manage users {category === 'library' ? 'with library subscriptions.' : 'with dedicated, startup, or cabin subscriptions.'}
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Active Subscribers Section */}
          <Card className="bg-surface shadow-md border-border-main/50">
            <CardHeader className="border-b border-border-main bg-primary/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-primary">
                    <Crown size={24} className="text-primary" /> Active Subscribers
                  </CardTitle>
                  <p className="text-sm text-text-main/60 mt-1">Users currently on an active plan.</p>
                </div>
                <Badge variant="primary" className="text-base px-3 py-1 shadow-sm">
                  {activeSubscribers.length} {activeSubscribers.length === 1 ? 'User' : 'Users'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activeSubscribers.length === 0 ? (
                <div className="py-12 text-center text-text-main/50">No active subscribers found.</div>
              ) : (
                <div className="divide-y divide-border-main">
                  {activeSubscribers.map((user) => {
                    const sub = user.active_subscription;
                    const workspaceType = sub.workspace.workspace_type;
                    const planName = getPlanName(workspaceType);

                    return (
                      <div key={user.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/[0.02]">
                        <div 
                          className="p-4 lg:p-6 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between"
                          onClick={() => toggleUser(user.id)}
                        >
                          {/* User Info */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                              {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-base">{user.first_name} {user.last_name}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-text-main/60">
                                <span className="flex items-center gap-1.5"><Mail size={12} /> {user.email}</span>
                                <span className="flex items-center gap-1.5"><Phone size={12} /> {user.phone_number || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Subscription Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-text-main/40 mb-1">Plan</p>
                              <p className="text-sm font-semibold">{planName}</p>
                              <p className="text-xs text-text-main/60 capitalize flex items-center gap-1 mt-0.5"><Hash size={10} />{workspaceType} ({sub.workspace.name})</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-text-main/40 mb-1">Start Date</p>
                              <p className="text-sm font-medium">{new Date(sub.start_time).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-text-main/40 mb-1">Expiry Date</p>
                              <p className="text-sm font-medium">{new Date(sub.end_time).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col items-start md:items-end justify-center">
                              <p className="text-[10px] uppercase font-bold text-text-main/40 mb-1">Status</p>
                              <Badge variant="success" className="px-2 py-0.5">Active</Badge>
                            </div>
                          </div>

                          <div className="hidden md:flex text-text-main/40 bg-black/5 dark:bg-white/5 p-2 rounded-full shrink-0 ml-4">
                            {expandedUser === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>

                        {expandedUser === user.id && <ExpandedUserDetails user={user} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inactive Users Section */}
          <Card className="bg-surface shadow-md border-border-main/50">
            <CardHeader className="border-b border-border-main bg-black/5 dark:bg-white/[0.02] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User size={24} className="text-text-main/70" /> Users Without a Subscription
                  </CardTitle>
                  <p className="text-sm text-text-main/60 mt-1">Registered users with no currently active plans.</p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1 shadow-sm bg-background">
                  {inactiveUsers.length} {inactiveUsers.length === 1 ? 'User' : 'Users'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {inactiveUsers.length === 0 ? (
                <div className="py-12 text-center text-text-main/50">No inactive users found.</div>
              ) : (
                <div className="divide-y divide-border-main">
                  {inactiveUsers.map((user) => (
                    <div key={user.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/[0.02]">
                      <div 
                        className="p-4 lg:p-6 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between"
                        onClick={() => toggleUser(user.id)}
                      >
                        {/* User Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-text-main/10 flex items-center justify-center text-text-main font-bold text-lg shrink-0">
                            {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-base">{user.first_name} {user.last_name}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-text-main/60">
                              <span className="flex items-center gap-1.5"><Mail size={12} /> {user.email}</span>
                              <span className="flex items-center gap-1.5"><Phone size={12} /> {user.phone_number || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 md:flex-[0.7]">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-text-main/40 mb-1">Registration Date</p>
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <Calendar size={14} className="text-text-main/60" /> 
                              {new Date(user.date_joined).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-start md:items-end justify-center">
                            <p className="text-[10px] uppercase font-bold text-text-main/40 mb-1">Current Status</p>
                            <Badge variant="outline" className="px-2 py-0.5 text-text-main/60 border-text-main/20">No Subscription</Badge>
                          </div>
                        </div>

                        <div className="hidden md:flex text-text-main/40 bg-black/5 dark:bg-white/5 p-2 rounded-full shrink-0 ml-4">
                          {expandedUser === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {expandedUser === user.id && <ExpandedUserDetails user={user} />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MapPin, Clock, ArrowRight, Calendar, FileText, CreditCard } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { userData, dashboardData } = useOutletContext();
  
  const { active_subscription, upcoming_subscriptions, payment_history, subscription_history } = dashboardData || {};

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{getGreeting()}, {userName}</h1>
          <p className="text-text-main/70">Here is what's happening with your workspace today.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Today's Workspace & Subscription Details */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Seat & Plan Details</CardTitle>
              <CardDescription>Current allocated seating and subscription info</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/pricing')}>
              <CreditCard className="w-4 h-4 mr-2" /> Renew / Upgrade
            </Button>
          </CardHeader>
          <CardContent>
            {active_subscription ? (
              <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-surface border border-border-main mb-6">
                <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <span className="text-3xl font-bold text-primary">{active_subscription.workspace.name}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-xl">
                      {active_subscription.workspace.workspace_type === 'library' ? 'Silent Reader Plan' : 
                       active_subscription.workspace.workspace_type === 'coworking' ? 'Coworking Desk' : 'Private Suite'}
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-background capitalize">{active_subscription.workspace.workspace_type} Zone</Badge>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm text-text-main/70 mt-4">
                     <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Floor 1, Main Wing</div>
                     <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 9 AM - 9 PM Access</div>
                     <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Purchased: {new Date(active_subscription.start_time).toLocaleDateString()}</div>
                     <div className={cn("flex items-center", isNearExpire ? "text-error font-medium" : "")}>
                       <Calendar className={cn("w-4 h-4 mr-2", isNearExpire ? "text-error animate-pulse" : "text-warning")} />
                       Expires: {new Date(active_subscription.end_time).toLocaleDateString()}
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl bg-surface border border-border-main border-dashed">
                <h3 className="text-lg font-medium text-text-main mb-2">No Active Subscription</h3>
                <p className="text-text-main/70 mb-6">You don't have an active workspace booking yet.</p>
                <Button onClick={() => navigate('/book')}>Book a Seat</Button>
              </div>
            )}

            {/* Upcoming Subscriptions */}
            {upcoming_subscriptions && upcoming_subscriptions.length > 0 && (
              <div className="mt-8 mb-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Subscription(s)</h3>
                <div className="space-y-4">
                  {upcoming_subscriptions.map((upcoming) => (
                    <div key={upcoming.id} className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-xl font-bold text-primary">{upcoming.workspace.name}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-lg">
                            {upcoming.workspace.workspace_type === 'library' ? 'Silent Reader Plan' : 
                             upcoming.workspace.workspace_type === 'coworking' ? 'Coworking Desk' : 'Private Suite'}
                          </h4>
                          <Badge variant="warning">Upcoming</Badge>
                        </div>
                        <div className="text-sm text-text-main/70">
                          <p>Starts on: <span className="font-medium text-text-main">{new Date(upcoming.start_time).toLocaleDateString()}</span></p>
                          <p>Expires on: {new Date(upcoming.end_time).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscription History */}
            {subscription_history && subscription_history.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Subscription History</h3>
                <div className="space-y-4">
                  {subscription_history.map((history) => (
                    <div key={history.id} className="flex items-center justify-between p-4 rounded-xl border border-border-main/50 bg-background/50 opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-border-main/20 flex items-center justify-center shrink-0">
                          <span className="font-semibold text-text-main/80">{history.workspace.name}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {history.workspace.workspace_type === 'library' ? 'Silent Reader Plan' : 
                             history.workspace.workspace_type === 'coworking' ? 'Coworking Desk' : 'Private Suite'}
                          </p>
                          <p className="text-xs text-text-main/60 mt-1">
                            Purchased: {new Date(history.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-text-main/60">
                            Valid: {new Date(history.start_time).toLocaleDateString()} - {new Date(history.end_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={history.status === 'UPGRADED' ? 'primary' : 'outline'} className="text-[10px]">
                        {history.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payment_history && payment_history.length > 0 ? (
                payment_history.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface border border-transparent hover:border-border-main transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">INV-{1000 + invoice.id}</p>
                        <p className="text-xs text-text-main/50">{new Date(invoice.start_time).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">₹{(invoice.workspace.price_per_hour * 8 * 30).toFixed(0)}</p>
                      <Badge variant="success" className="text-[10px] px-1.5 py-0 mt-1">Paid</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-main/50 text-center py-4">No payment history found.</p>
              )}
            </div>
            {payment_history && payment_history.length > 0 && (
              <Button variant="ghost" className="w-full mt-4 text-sm text-primary">
                View All Invoices <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

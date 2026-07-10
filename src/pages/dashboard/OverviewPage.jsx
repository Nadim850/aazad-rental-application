import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MapPin, Clock, ArrowRight, Activity, Users, QrCode, Calendar, FileText, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Good morning, Alex</h1>
          <p className="text-text-main/70">Here is what's happening with your workspace today.</p>
        </div>
        <Button leftIcon={<QrCode size={18} />}>
          Show Entry Pass
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/50 shadow-sm shadow-primary/5">
          <CardHeader className="pb-2">
            <CardDescription>Active Subscription</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Silent Reader</CardTitle>
              <Badge variant="success">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex flex-col gap-2 text-sm text-text-main/70">
              <div className="flex items-center justify-between">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Expires:</span>
                <span className="font-medium text-text-main">Nov 24, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Renews in:</span>
                <span className="font-medium text-warning">14 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Study Hours</CardDescription>
            <CardTitle className="text-2xl">42.5 hrs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex items-center text-sm text-success">
              <Activity className="w-4 h-4 mr-2" />
              +12% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Bookings</CardDescription>
            <CardTitle className="text-2xl">2</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="mt-4 flex items-center text-sm text-text-main/70">
              <Users className="w-4 h-4 mr-2" />
              Next: Meeting Room A (2:00 PM)
            </div>
          </CardContent>
        </Card>
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
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-surface border border-border-main mb-6">
              <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <span className="text-3xl font-bold text-primary">L-12</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-xl">Silent Reader Plan</h3>
                  <Badge variant="outline" className="bg-background">Library Zone</Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-2 mb-4 text-sm text-text-main/70">
                   <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Floor 1, Quiet Wing</div>
                   <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 9 AM - 9 PM Access</div>
                   <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Purchased: Oct 24, 2026</div>
                </div>
                <div className="flex gap-3 mt-4 pt-4 border-t border-border-main/50">
                  <Button variant="outline" size="sm" onClick={() => navigate('/book')}>Change Seat</Button>
                  <Button variant="ghost" size="sm">Report Issue</Button>
                </div>
              </div>
            </div>
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
              {[
                { id: 'INV-4921', date: 'Oct 24, 2026', amount: '₹2,358', status: 'Paid' },
                { id: 'INV-3810', date: 'Sep 24, 2026', amount: '₹2,358', status: 'Paid' },
                { id: 'INV-2705', date: 'Aug 24, 2026', amount: '₹2,358', status: 'Paid' },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface border border-transparent hover:border-border-main transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FileText size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{invoice.id}</p>
                      <p className="text-xs text-text-main/50">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{invoice.amount}</p>
                    <Badge variant="success" className="text-[10px] px-1.5 py-0 mt-1">{invoice.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-primary">
              View All Invoices <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

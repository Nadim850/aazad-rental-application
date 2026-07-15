import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const kpis = [
    { name: 'Monthly Recurring Revenue', value: '₹4,82,500', trend: '+14.5%', icon: DollarSign },
    { name: 'Active Subscriptions', value: '1,248', trend: '+8.2%', icon: Users },
    { name: 'Current Occupancy', value: '86%', trend: '+2.1%', icon: Activity },
    { name: 'Conversion Rate', value: '12.4%', trend: '-1.4%', icon: TrendingUp, negative: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1 text-text-main">Analytics</h1>
          <p className="text-sm text-text-main/50">Track your workspace metrics and revenue.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-black/5 dark:bg-white/[0.02] border border-border-main rounded-xl p-5 hover:bg-black/10 dark:hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 bg-black/10 dark:bg-white/5 rounded-lg text-text-main/70">
                 <kpi.icon size={18} />
               </div>
               <span className={`text-xs font-medium ${kpi.negative ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                 {kpi.trend}
               </span>
            </div>
            <p className="text-[13px] text-text-main/50 font-medium mb-1">{kpi.name}</p>
            <h3 className="text-2xl font-semibold text-text-main tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Mock Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-black/5 dark:bg-white/[0.02] border border-border-main rounded-xl p-6 h-96 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-main">Revenue Over Time</h3>
            <p className="text-xs text-text-main/50">Daily MRR additions vs churn</p>
          </div>
          {/* Abstract chart representation */}
          <div className="flex-1 flex items-end gap-2 px-4 relative">
             {/* Chart grid lines */}
             <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none">
               {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-border-main" />)}
             </div>
             
             {/* Bars */}
             {Array.from({length: 24}).map((_, i) => (
               <div key={i} className="flex-1 flex flex-col justify-end group">
                 <div 
                   className="w-full bg-primary/40 rounded-t-sm group-hover:bg-primary transition-colors relative"
                   style={{ height: `${40 + Math.random() * 60}%` }}
                 >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/10 dark:bg-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap transition-opacity backdrop-blur-md border border-border-main z-10">
                     ₹{Math.floor(10 + Math.random() * 20)},000
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-black/5 dark:bg-white/[0.02] border border-border-main rounded-xl p-6 h-96 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-main">Recent Transactions</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-xs font-medium group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                    {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-text-main/90">Premium Desk</p>
                    <p className="text-[11px] text-text-main/40">Invoice #INV-24{i}9</p>
                  </div>
                </div>
                <span className="text-[13px] font-medium text-emerald-500 dark:text-emerald-400">+₹5,999</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

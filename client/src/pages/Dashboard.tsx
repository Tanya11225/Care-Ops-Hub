import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { useDashboardStats, useAlerts, useBookings } from "@/hooks/use-care-ops";
import { 
  CalendarClock, 
  FileCheck, 
  AlertTriangle, 
  DollarSign, 
  Bell 
} from "lucide-react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for chart - in real app, fetch from API
const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

export default function Dashboard() {
  const { data: stats } = useDashboardStats();
  const { data: alerts } = useAlerts();
  const { data: bookings } = useBookings();

  // Get recent 5 bookings
  const recentBookings = bookings?.slice(0, 5) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your business operations"
        action={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </span>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          title="Today's Bookings" 
          value={stats?.todayBookings || 0}
          icon={<CalendarClock className="w-5 h-5" />}
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <StatsCard 
          title="Confirmed Orders" 
          value={stats?.confirmedBookings || 0}
          icon={<FileCheck className="w-5 h-5" />}
          trend="+5%"
          trendUp={true}
          color="green"
        />
        <StatsCard 
          title="Low Stock Alerts" 
          value={stats?.lowStockItems || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={stats?.lowStockItems ? "⚠ Action needed" : "✓ All good"}
          trendUp={!stats?.lowStockItems}
          color={stats?.lowStockItems ? "amber" : "green"}
        />
        <StatsCard 
          title="Total Revenue" 
          value={`$${((stats?.totalRevenue || 0) / 100).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
          icon={<DollarSign className="w-5 h-5" />}
          trend="+8.2%"
          trendUp={true}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Revenue Overview</h3>
                <p className="text-sm text-muted-foreground mt-1">Weekly performance snapshot</p>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', backgroundColor: 'hsl(var(--card))' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelStyle={{color: 'hsl(var(--foreground))'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-bold text-foreground mb-6">Recently Scheduled</h3>
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/40 transition-all duration-200 group border border-transparent hover:border-border/50">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {booking.contact?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate">{booking.contact?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{booking.service?.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-medium text-sm text-foreground">
                      {format(new Date(booking.startTime), "MMM d")}
                    </p>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      booking.status === 'confirmed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : booking.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No recent bookings found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Alerts */}
        <div className="bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border border-border/30 shadow-sm h-fit hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Notifications</h3>
            {stats?.unreadAlerts ? (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {stats?.unreadAlerts} New
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                All clear
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {alerts && alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className={`flex gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  alert.isRead 
                    ? 'bg-muted/20 border-border/30 text-muted-foreground'
                    : 'bg-amber-50 border-amber-200/50 text-amber-900'
                }`}>
                  <Bell className={`w-4 h-4 shrink-0 mt-0.5 ${alert.isRead ? 'opacity-40' : 'text-amber-600'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{alert.message}</p>
                    <p className="text-xs opacity-70 mt-1">Just now</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs opacity-70 mt-1">No pending notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

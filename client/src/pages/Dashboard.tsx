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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Today's Bookings" 
          value={stats?.todayBookings || 0}
          icon={<CalendarClock className="w-6 h-6" />}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard 
          title="Pending Forms" 
          value={stats?.pendingForms || 0}
          icon={<FileCheck className="w-6 h-6" />}
        />
        <StatsCard 
          title="Low Stock Items" 
          value={stats?.lowStockItems || 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={stats?.lowStockItems ? "Needs Action" : "All Good"}
          trendUp={!stats?.lowStockItems}
        />
        <StatsCard 
          title="Est. Revenue" 
          value={`$${((stats?.revenue || 0) / 100).toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+8%"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Revenue Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {booking.contact?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">{booking.contact?.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.service?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {format(new Date(booking.startTime), "MMM d, h:mm a")}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No recent bookings found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Alerts */}
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Notifications</h3>
            <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded-full">
              {stats?.unreadAlerts || 0} New
            </span>
          </div>
          
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <div key={alert.id} className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <Bell className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {/* Just now */}
                    Action required
                  </p>
                </div>
              </div>
            ))}
            {(!alerts || alerts.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

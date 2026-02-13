import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  FileText, 
  Package, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Forms', href: '/forms', icon: FileText },
  { name: 'Inventory', href: '/inventory', icon: Package },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-card/95 border-r border-border/30">
      {/* Logo Area */}
      <div className="p-6 pb-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200 group-hover:blur-md"></div>
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">CareOps</h1>
            <p className="text-xs text-muted-foreground font-medium">Control Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border border-primary/20 shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-200", 
                    isActive 
                      ? "text-primary scale-110" 
                      : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                  )} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-primary opacity-70" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="px-3 mb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>

      {/* User / Logout */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 rounded-xl p-4 hover:from-muted/60 hover:to-muted/30 hover:border-border/50 transition-all duration-200 group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm font-display shadow-md">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.firstName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button 
              onClick={() => logout()} 
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200 group-hover:scale-110"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

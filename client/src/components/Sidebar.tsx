import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  FileText, 
  Package, 
  Settings, 
  LogOut 
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
    <div className="flex flex-col h-full bg-card border-r border-border/50">
      {/* Logo Area */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">CareOps</h1>
            <p className="text-xs text-muted-foreground">Unified Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User / Logout */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white font-medium text-sm">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button 
            onClick={() => logout()} 
            className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

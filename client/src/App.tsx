import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

// Pages
import Dashboard from "@/pages/Dashboard";
import Inbox from "@/pages/Inbox";
import Bookings from "@/pages/Bookings";
import Inventory from "@/pages/Inventory";
import Contacts from "@/pages/Contacts";
import Forms from "@/pages/Forms";
import AuthPage from "@/pages/AuthPage";
import PublicBooking from "@/pages/PublicBooking";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Component />
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/book" component={PublicBooking} />

      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/inbox">
        <ProtectedRoute component={Inbox} />
      </Route>
      <Route path="/bookings">
        <ProtectedRoute component={Bookings} />
      </Route>
      <Route path="/contacts">
        <ProtectedRoute component={Contacts} />
      </Route>
      <Route path="/forms">
        <ProtectedRoute component={Forms} />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute component={Inventory} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

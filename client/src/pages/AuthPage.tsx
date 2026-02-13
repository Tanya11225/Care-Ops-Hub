import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side - Brand */}
      <div className="md:w-1/2 bg-primary relative overflow-hidden flex flex-col justify-between p-12 text-primary-foreground">
        <div className="relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            CareOps
          </h1>
          <p className="text-xl opacity-90 font-light max-w-md">
            The unified operations platform for modern service businesses.
          </p>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm opacity-70">© 2024 CareOps Inc.</p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/30 blur-3xl pointer-events-none" />
      </div>

      {/* Right Side - Login */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-bold font-display text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to manage your operations</p>
          </div>

          <a 
            href="/api/login"
            className="block w-full py-4 px-6 bg-foreground text-background rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:-translate-y-1"
          >
            Sign in with Replit
          </a>

          <p className="text-xs text-muted-foreground mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "blue" | "green" | "amber" | "red" | "purple";
}

const colorMap = {
  blue: "from-blue-50 to-blue-100/50 border-blue-200/50",
  green: "from-emerald-50 to-emerald-100/50 border-emerald-200/50",
  amber: "from-amber-50 to-amber-100/50 border-amber-200/50",
  red: "from-red-50 to-red-100/50 border-red-200/50",
  purple: "from-purple-50 to-purple-100/50 border-purple-200/50",
};

const iconColorMap = {
  blue: "bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600",
  green: "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600",
  amber: "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600",
  red: "bg-gradient-to-br from-red-100 to-red-50 text-red-600",
  purple: "bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600",
};

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  className,
  color = "blue"
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-gradient-to-br rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group",
      colorMap[color],
      className
    )}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-foreground font-display tracking-tight">{value}</h3>
          </div>
          <div className={cn(
            "p-3 rounded-xl group-hover:scale-110 transition-transform duration-300",
            iconColorMap[color]
          )}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            {trendUp ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">{trend}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                <span className="text-red-700">{trend}</span>
              </>
            )}
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

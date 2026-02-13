import { PageHeader } from "@/components/PageHeader";
import { useInventory, useUpdateInventory } from "@/hooks/use-care-ops";
import { Package, AlertTriangle, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Inventory() {
  const { data: items, isLoading } = useInventory();
  const updateMutation = useUpdateInventory();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdjust = (id: number, current: number, change: number) => {
    updateMutation.mutate({ id, quantity: Math.max(0, current + change) });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in">
      <PageHeader 
        title="Inventory" 
        description="Track resources and stock levels"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium">
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        }
      />

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          placeholder="Search inventory..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems?.map((item) => {
          const isLowStock = item.quantity <= item.lowStockThreshold;
          return (
            <div 
              key={item.id}
              className={cn(
                "group bg-card p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                isLowStock ? "border-destructive/30 bg-destructive/5" : "border-border/50"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm">
                  <Package className={cn("w-6 h-6", isLowStock ? "text-destructive" : "text-primary")} />
                </div>
                {isLowStock && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    <AlertTriangle className="w-3 h-3" />
                    Low Stock
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">SKU: {item.sku || "N/A"}</p>
              
              <div className="flex items-center justify-between p-2 bg-background/50 rounded-xl border border-border/50">
                <button 
                  onClick={() => handleAdjust(item.id, item.quantity, -1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="block text-lg font-bold font-display">{item.quantity}</span>
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">In Stock</span>
                </div>
                <button 
                  onClick={() => handleAdjust(item.id, item.quantity, 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

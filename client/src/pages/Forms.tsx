import { PageHeader } from "@/components/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Edit2, Trash2, Copy, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Form {
  id: number;
  title: string;
  description: string;
  fields: string[];
  isActive: boolean;
}

export default function Forms() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    fields: "[]",
    isActive: true 
  });

  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
    queryFn: async () => {
      const res = await fetch("/api/forms");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", fields: "[]", isActive: true });
    }
  });

  const handleCreate = () => {
    if (!formData.title) return;
    createMutation.mutate({
      ...formData,
      fields: formData.fields ? (typeof formData.fields === 'string' ? JSON.parse(formData.fields) : formData.fields) : []
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in">
      <PageHeader 
        title="Forms" 
        description="Create and manage custom feedback and request forms"
        action={
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            New Form
          </button>
        }
      />

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading forms...</div>
        ) : forms.length > 0 ? (
          forms.map((form) => (
            <div 
              key={form.id}
              className={cn(
                "group relative bg-gradient-to-br rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden",
                form.isActive 
                  ? "from-purple-50 to-purple-100/50 border-purple-200/50" 
                  : "from-slate-50 to-slate-100/50 border-slate-200/50 opacity-75"
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-200/50 to-purple-100/30 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                      form.isActive 
                        ? "bg-emerald-200/50 text-emerald-700" 
                        : "bg-slate-200/50 text-slate-700"
                    )}>
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {form.title}
                </h3>
                <p className="text-sm text-foreground/70 mb-4 line-clamp-2 min-h-10">
                  {form.description}
                </p>

                {/* Fields Count */}
                <div className="flex items-center gap-2 mb-6 p-3 bg-foreground/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium">Form Fields</p>
                    <p className="text-sm font-semibold text-foreground">{form.fields?.length || 0} fields</p>
                  </div>
                  <div className="text-right text-right">
                    <p className="text-xs text-muted-foreground font-medium">Responses</p>
                    <p className="text-sm font-semibold text-primary">0</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-foreground/10 grid grid-cols-4">
                  <button title="Preview" className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors group-hover:scale-105 duration-200 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-foreground/70" />
                  </button>
                  <button title="Duplicate" className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors group-hover:scale-105 duration-200 flex items-center justify-center">
                    <Copy className="w-4 h-4 text-foreground/70" />
                  </button>
                  <button title="Edit" className="p-2 bg-blue-100/40 hover:bg-blue-100/60 text-blue-700 rounded-lg transition-colors group-hover:scale-105 duration-200 flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button title="Delete" className="p-2 bg-red-100/40 hover:bg-red-100/60 text-red-700 rounded-lg transition-colors group-hover:scale-105 duration-200 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              {form.isActive && (
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-500 to-green-300 group-hover:w-0.5 transition-all duration-300"></div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-gradient-to-br from-card to-card/50 rounded-2xl border border-dashed border-border">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No forms created yet</h3>
            <p className="text-muted-foreground mt-2">Create your first form to collect feedback and requests.</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {forms.length > 0 && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Total Forms</p>
            <p className="text-2xl font-bold text-blue-700">{forms.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Active Forms</p>
            <p className="text-2xl font-bold text-emerald-700">{forms.filter(f => f.isActive).length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Total Fields</p>
            <p className="text-2xl font-bold text-amber-700">{forms.reduce((sum, f) => sum + (f.fields?.length || 0), 0)}</p>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-card to-card/50 w-full max-w-md rounded-2xl shadow-2xl border border-border/50 p-6 animate-in">
            <h2 className="text-2xl font-bold font-display mb-6">Create New Form</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Form Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Customer Feedback"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this form is for..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Field Names (JSON)</label>
                <textarea
                  value={formData.fields}
                  onChange={(e) => setFormData({...formData, fields: e.target.value})}
                  placeholder='["name", "email", "message"]'
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-foreground/5 rounded-xl">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <label htmlFor="isActive" className="flex-1 text-sm font-medium cursor-pointer">Activate form immediately</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create Form"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

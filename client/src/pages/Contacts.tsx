import { PageHeader } from "@/components/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, Badge } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'new' | 'inactive';
  createdAt: string;
}

export default function Contacts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", status: "active" });

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const res = await fetch(`/api/contacts?search=${searchTerm}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "", status: "active" });
    }
  });

  const handleCreate = () => {
    if (!formData.name || !formData.email) return;
    createMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'from-emerald-50 to-emerald-100/50 border-emerald-200/50 text-emerald-700';
      case 'new':
        return 'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-700';
      case 'inactive':
        return 'from-slate-50 to-slate-100/50 border-slate-200/50 text-slate-700';
      default:
        return 'from-muted/50 to-muted/20';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in">
      <PageHeader 
        title="Contacts" 
        description="Manage your customer and client relationships"
        action={
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            New Contact
          </button>
        }
      />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-card to-card/50 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading contacts...</div>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <div 
              key={contact.id}
              className={cn(
                "group bg-gradient-to-br rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden",
                getStatusColor(contact.status)
              )}
            >
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-semibold group-hover:scale-110 transition-transform duration-200">
                    {contact.name[0]?.toUpperCase()}
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                    contact.status === 'active' ? 'bg-emerald-200/50 text-emerald-700' :
                    contact.status === 'new' ? 'bg-blue-200/50 text-blue-700' :
                    'bg-slate-200/50 text-slate-700'
                  )}>
                    {contact.status}
                  </span>
                </div>

                {/* Contact Info */}
                <h3 className="text-lg font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {contact.name}
                </h3>

                <div className="space-y-3 mb-6">
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors group/link">
                    <Mail className="w-4 h-4 opacity-60 group-hover/link:opacity-100" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors group/link">
                    <Phone className="w-4 h-4 opacity-60 group-hover/link:opacity-100" />
                    <span>{contact.phone}</span>
                  </a>
                  <div className="flex items-start gap-3 text-sm text-foreground/80">
                    <MapPin className="w-4 h-4 opacity-60 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{contact.address}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-foreground/10">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-sm font-medium transition-colors group-hover:scale-105 duration-200">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100/20 hover:bg-red-100/40 text-red-700 rounded-lg text-sm font-medium transition-colors group-hover:scale-105 duration-200">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-gradient-to-br from-card to-card/50 rounded-2xl border border-dashed border-border">
            <Badge className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No contacts found</h3>
            <p className="text-muted-foreground mt-2">Create a new contact to get started.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-card to-card/50 w-full max-w-md rounded-2xl shadow-2xl border border-border/50 p-6 animate-in">
            <h2 className="text-2xl font-bold font-display mb-6">Add New Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="555-1234"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main St"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
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
                  {createMutation.isPending ? "Creating..." : "Create Contact"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

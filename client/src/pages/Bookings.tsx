import { PageHeader } from "@/components/PageHeader";
import { useBookings, useCreateBooking } from "@/hooks/use-care-ops";
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Assuming standard shadcn-like structure or we build simple one
import { Calendar as CalendarIcon, Clock, Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Simplified create for demo
  const createMutation = useCreateBooking();
  const [formData, setFormData] = useState({
    contactId: 1, // Mock
    serviceId: 1, // Mock
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: 'pending'
  });

  const handleCreate = () => {
    // In real app, proper form with validation
    createMutation.mutate(formData as any); 
    setIsCreateOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in">
      <PageHeader 
        title="Bookings" 
        description="Manage your schedule and appointments"
        action={
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            New Booking
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
          <button 
            key={status}
            className="px-4 py-1.5 rounded-full border border-border bg-card text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>
        ) : bookings?.map((booking) => (
          <div 
            key={booking.id}
            className="group bg-card p-5 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/5 flex flex-col items-center justify-center text-primary border border-primary/10">
                <span className="text-xs font-bold uppercase">{format(new Date(booking.startTime), "MMM")}</span>
                <span className="text-lg font-bold font-display">{format(new Date(booking.startTime), "d")}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {booking.service?.name || "Service Appointment"}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                  </span>
                  <span>•</span>
                  <span>{booking.contact?.name || "Unknown Client"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
                booking.status === 'confirmed' ? "bg-green-100 text-green-700" :
                booking.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              )}>
                {booking.status}
              </span>
              <button className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                Details
              </button>
            </div>
          </div>
        ))}
        {bookings?.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-medium">No bookings found</h3>
            <p className="text-muted-foreground">Create a new booking to get started.</p>
          </div>
        )}
      </div>

      {/* Simple Dialog Overlay for Creating Booking */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in">
            <h2 className="text-2xl font-bold font-display mb-4">New Booking</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service</label>
                <select className="w-full p-2 rounded-xl border border-border bg-background">
                  <option>Consultation (30 min)</option>
                  <option>Full Service (60 min)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input type="datetime-local" className="w-full p-2 rounded-xl border border-border bg-background" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

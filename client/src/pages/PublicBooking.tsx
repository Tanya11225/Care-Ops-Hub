import { useState } from "react";
import { useServices } from "@/hooks/use-care-ops";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { format } from "date-fns";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Minimal public booking page without sidebar
export default function PublicBooking() {
  const { data: services } = useServices();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [date, setDate] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });

  const createBooking = useMutation({
    mutationFn: async (data: any) => {
      // First create contact, then booking (simplified logic for demo)
      const contactRes = await fetch(api.contacts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contact.name, email: contact.email, phone: contact.phone }),
      });
      const newContact = await contactRes.json();
      
      await fetch(api.bookings.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: newContact.id,
          serviceId: selectedService.id,
          startTime: new Date(date).toISOString(),
          endTime: new Date(new Date(date).getTime() + selectedService.duration * 60000).toISOString(),
        }),
      });
    },
    onSuccess: () => setStep(4)
  });

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-8 text-primary-foreground text-center">
          <h1 className="text-3xl font-bold font-display mb-2">Book an Appointment</h1>
          <p className="opacity-90">Select a service and time that works for you</p>
        </div>

        <div className="p-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8 gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn(
                "w-3 h-3 rounded-full transition-colors",
                step >= s ? "bg-primary" : "bg-muted"
              )} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-in">
              <h2 className="text-xl font-bold mb-4">Select Service</h2>
              <div className="grid gap-3">
                {services?.map(service => (
                  <div 
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                      selectedService?.id === service.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{service.name}</span>
                      <span className="text-sm font-medium bg-background px-2 py-1 rounded-md border border-border">
                        ${(service.price / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration} mins
                    </p>
                  </div>
                ))}
              </div>
              <button 
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in">
              <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>
              <input 
                type="datetime-local" 
                className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setStep(1)}
                  className="w-full py-3 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all"
                >
                  Back
                </button>
                <button 
                  disabled={!date}
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in">
              <h2 className="text-xl font-bold mb-4">Your Details</h2>
              <input 
                placeholder="Full Name" 
                className="w-full p-4 rounded-xl border border-border bg-background"
                onChange={(e) => setContact({...contact, name: e.target.value})}
              />
              <input 
                placeholder="Email Address" 
                type="email"
                className="w-full p-4 rounded-xl border border-border bg-background"
                onChange={(e) => setContact({...contact, email: e.target.value})}
              />
              <input 
                placeholder="Phone Number" 
                className="w-full p-4 rounded-xl border border-border bg-background"
                onChange={(e) => setContact({...contact, phone: e.target.value})}
              />
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-3 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={() => createBooking.mutate(null)}
                  disabled={createBooking.isPending}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8 animate-in">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold font-display mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-8">
                We've sent a confirmation email to {contact.email}.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
              >
                Book Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

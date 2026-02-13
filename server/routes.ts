import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Setup Chat/Audio/Image Integrations
  // Using Audio routes for voice features, which includes conversation management
  registerAudioRoutes(app); 
  registerImageRoutes(app);

  // Core Business Routes

  // Contacts
  app.get(api.contacts.list.path, async (req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.get(api.contacts.get.path, async (req, res) => {
    const contact = await storage.getContact(Number(req.params.id));
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  });

  app.post(api.contacts.create.path, async (req, res) => {
    try {
      const input = api.contacts.create.input.parse(req.body);
      const contact = await storage.createContact(input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.contacts.update.path, async (req, res) => {
    try {
      const input = api.contacts.update.input.parse(req.body);
      const contact = await storage.updateContact(Number(req.params.id), input);
      res.json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.contacts.delete.path, async (req, res) => {
    await storage.deleteContact(Number(req.params.id));
    res.status(204).send();
  });

  // Services
  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.post(api.services.create.path, async (req, res) => {
    try {
      const input = api.services.create.input.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Bookings
  app.get(api.bookings.list.path, async (req, res) => {
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.get(api.bookings.get.path, async (req, res) => {
    const booking = await storage.getBooking(Number(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      // Coerce dates from strings if necessary (Zod handles ISO strings to Date usually)
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking(input);
      
      // Auto-create forms if needed (Mock logic)
      if (booking.serviceId) {
        await storage.createForm({
          bookingId: booking.id,
          contactId: booking.contactId,
          type: "intake",
          status: "pending",
          content: {}
        });
      }
      
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.bookings.update.path, async (req, res) => {
    try {
      const input = api.bookings.update.input.parse(req.body);
      const booking = await storage.updateBooking(Number(req.params.id), input);
      res.json(booking);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Forms
  app.get(api.forms.list.path, async (req, res) => {
    const forms = await storage.getForms();
    res.json(forms);
  });

  app.post(api.forms.create.path, async (req, res) => {
    try {
      const input = api.forms.create.input.parse(req.body);
      const form = await storage.createForm(input);
      res.status(201).json(form);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.forms.update.path, async (req, res) => {
    try {
      const input = api.forms.update.input.parse(req.body);
      const form = await storage.updateForm(Number(req.params.id), input);
      res.json(form);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Inventory
  app.get(api.inventory.list.path, async (req, res) => {
    const items = await storage.getInventory();
    res.json(items);
  });

  app.post(api.inventory.create.path, async (req, res) => {
    try {
      const input = api.inventory.create.input.parse(req.body);
      const item = await storage.createInventory(input);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.inventory.update.path, async (req, res) => {
    try {
      const input = api.inventory.update.input.parse(req.body);
      const item = await storage.updateInventory(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Alerts
  app.get(api.alerts.list.path, async (req, res) => {
    const alerts = await storage.getAlerts();
    res.json(alerts);
  });

  app.patch(api.alerts.markRead.path, async (req, res) => {
    const alert = await storage.markAlertRead(Number(req.params.id));
    res.json(alert);
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const services = await storage.getServices();
  if (services.length === 0) {
    console.log("Seeding database...");
    
    // Services
    const s1 = await storage.createService({ name: "Initial Consultation", description: "30 min intro call", duration: 30, price: 0 });
    const s2 = await storage.createService({ name: "Standard Cleaning", description: "Regular home cleaning", duration: 120, price: 15000 });
    const s3 = await storage.createService({ name: "Deep Cleaning", description: "Thorough deep clean", duration: 240, price: 30000 });
    
    // Contacts
    const c1 = await storage.createContact({ name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", status: "active" });
    const c2 = await storage.createContact({ name: "Bob Smith", email: "bob@example.com", phone: "555-0102", status: "new" });
    
    // Bookings
    await storage.createBooking({
      contactId: c1.id,
      serviceId: s2.id,
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      endTime: new Date(Date.now() + 86400000 + 7200000),
      status: "confirmed",
      notes: "Gate code: 1234"
    });
    
    await storage.createBooking({
      contactId: c2.id,
      serviceId: s1.id,
      startTime: new Date(Date.now() + 172800000), // Day after tomorrow
      endTime: new Date(Date.now() + 172800000 + 1800000),
      status: "pending",
      notes: "Interested in weekly service"
    });

    // Inventory
    await storage.createInventory({ name: "Cleaning Solution A", quantity: 10, lowStockThreshold: 5, sku: "SOL-A" });
    await storage.createInventory({ name: "Microfiber Cloths", quantity: 50, lowStockThreshold: 10, sku: "CLOTH-M" });
    await storage.createInventory({ name: "Vacuum Bags", quantity: 3, lowStockThreshold: 5, sku: "VAC-B" }); // Should trigger alert

    // Alerts (manual trigger for seed)
    await storage.createAlert({
      type: "low_stock",
      message: "Low stock warning: Vacuum Bags is down to 3",
      relatedId: 3, // Assuming ID 3
      isRead: false
    });
    
    console.log("Database seeded!");
  }
}

import { db } from "./db";
import {
  users, contacts, services, bookings, forms, inventory, alerts, conversations, messages,
  type User, type InsertUser,
  type Contact, type InsertContact,
  type Service, type InsertService,
  type Booking, type InsertBooking,
  type Form, type InsertForm,
  type InventoryItem, type InsertInventory,
  type Alert, type InsertAlert,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type DashboardStats
} from "@shared/schema";
import { eq, desc, sql, and, lt } from "drizzle-orm";

export interface IStorage {
  // Users (Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;

  // Bookings
  getBookings(): Promise<(Booking & { contact: Contact | null, service: Service | null })[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;

  // Forms
  getForms(): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form>;

  // Inventory
  getInventory(): Promise<InventoryItem[]>;
  createInventory(item: InsertInventory): Promise<InventoryItem>;
  updateInventory(id: number, item: Partial<InsertInventory>): Promise<InventoryItem>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertRead(id: number): Promise<Alert>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact> {
    const [contact] = await db.update(contacts).set(updates).where(eq(contacts.id, id)).returning();
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  // Bookings
  async getBookings(): Promise<(Booking & { contact: Contact | null, service: Service | null })[]> {
    // Basic join simulation using query builder (or direct join if Drizzle supported fully in this version, assuming standard select)
    // For simplicity, fetching all and mapping or using Drizzle's query.bookings.findMany({ with: ... })
    // Using query builder's 'with' syntax is preferred if available, but manual is safer for now.
    
    // Using a raw query or simple separate fetches might be safer to ensure type correctness without complex Drizzle relational setup
    // But let's try to use the query builder properly.
    return await db.query.bookings.findMany({
      with: {
        contact: true,
        service: true
      },
      orderBy: [desc(bookings.startTime)]
    });
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: number, updates: Partial<InsertBooking>): Promise<Booking> {
    const [booking] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return booking;
  }

  // Forms
  async getForms(): Promise<Form[]> {
    return await db.select().from(forms).orderBy(desc(forms.sentAt));
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db.insert(forms).values(insertForm).returning();
    return form;
  }

  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form> {
    const [form] = await db.update(forms).set(updates).where(eq(forms.id, id)).returning();
    return form;
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory).orderBy(inventory.name);
  }

  async createInventory(insertInventory: InsertInventory): Promise<InventoryItem> {
    const [item] = await db.insert(inventory).values(insertInventory).returning();
    return item;
  }

  async updateInventory(id: number, updates: Partial<InsertInventory>): Promise<InventoryItem> {
    const [item] = await db.update(inventory).set(updates).where(eq(inventory.id, id)).returning();
    
    // Check low stock and create alert if needed
    if (item.quantity <= item.lowStockThreshold) {
      await this.createAlert({
        type: "low_stock",
        message: `Low stock warning: ${item.name} is down to ${item.quantity}`,
        relatedId: item.id,
        isRead: false
      });
    }
    
    return item;
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async markAlertRead(id: number): Promise<Alert> {
    const [alert] = await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id)).returning();
    return alert;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // Today's bookings
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todayBookingsCount = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(
        sql`${bookings.startTime} >= ${startOfDay}`,
        sql`${bookings.startTime} < ${endOfDay}`
      ));

    // Upcoming bookings (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingBookingsCount = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(
        sql`${bookings.startTime} > ${endOfDay}`,
        sql`${bookings.startTime} <= ${nextWeek}`
      ));

    // Pending Forms
    const pendingFormsCount = await db.select({ count: sql<number>`count(*)` })
      .from(forms)
      .where(eq(forms.status, "pending"));

    // Low Stock
    const lowStockCount = await db.select({ count: sql<number>`count(*)` })
      .from(inventory)
      .where(sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`);

    // Unread Alerts
    const unreadAlertsCount = await db.select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(eq(alerts.isRead, false));

    // Revenue (completed bookings * service price) - approximation
    // Need to join bookings and services
    const completedBookings = await db.select({
      price: services.price
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.status, "completed"));

    const revenue = completedBookings.reduce((sum, b) => sum + b.price, 0);

    return {
      todayBookings: Number(todayBookingsCount[0]?.count || 0),
      upcomingBookings: Number(upcomingBookingsCount[0]?.count || 0),
      pendingForms: Number(pendingFormsCount[0]?.count || 0),
      lowStockItems: Number(lowStockCount[0]?.count || 0),
      unreadAlerts: Number(unreadAlertsCount[0]?.count || 0),
      revenue: revenue
    };
  }
}

export const storage = new DatabaseStorage();

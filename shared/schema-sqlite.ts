import { sqliteTable, text, integer, boolean, blob } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// AUTH & USERS
// ============================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default("staff").notNull(), // 'admin' or 'staff'
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: integer("expire", { mode: "timestamp" }).notNull(),
});

// ============================================
// CHAT & COMMUNICATIONS
// ============================================
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  contactId: integer("contact_id"), // Link conversation to a contact
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' (contact), 'assistant' (AI), 'agent' (human staff)
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ============================================
// CORE BUSINESS ENTITIES
// ============================================

// Contacts (Leads/Customers)
export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").default("new").notNull(), // 'new', 'active', 'inactive'
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Services (Offerings)
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // minutes
  price: integer("price").notNull(), // cents
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Bookings (Appointments)
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  serviceId: integer("service_id").references(() => services.id),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'confirmed', 'completed', 'cancelled'
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Forms (Digital Forms/Intake)
export const forms = sqliteTable("forms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").references(() => bookings.id),
  contactId: integer("contact_id").references(() => contacts.id),
  type: text("type").notNull(), // 'intake', 'feedback', 'consent'
  status: text("status").default("pending").notNull(), // 'pending', 'completed', 'submitted'
  content: text("content").notNull(), // JSON string
  sentAt: integer("sent_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// Inventory (Supplies/Products)
export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  sku: text("sku").unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Alerts (Notifications)
export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // 'low_stock', 'booking_conflict', 'new_contact'
  message: text("message").notNull(),
  relatedId: integer("related_id"), // ID of related entity
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.sid],
    references: [users.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ many }) => ({
  bookings: many(bookings),
  forms: many(forms),
  conversations: many(conversations),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [bookings.contactId],
    references: [contacts.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  forms: many(forms),
}));

export const formsRelations = relations(forms, ({ one }) => ({
  booking: one(bookings, {
    fields: [forms.bookingId],
    references: [bookings.id],
  }),
  contact: one(contacts, {
    fields: [forms.contactId],
    references: [contacts.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [conversations.contactId],
    references: [contacts.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ many }) => ({
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  inventory: one(inventory, {
    fields: [alerts.relatedId],
    references: [inventory.id],
  }),
}));

// ============================================
// INSERT SCHEMAS (for validation)
// ============================================

export const insertUserSchema = createInsertSchema(users);
export const insertSessionSchema = createInsertSchema(sessions);
export const insertContactSchema = createInsertSchema(contacts);
export const insertServiceSchema = createInsertSchema(services);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertFormSchema = createInsertSchema(forms);
export const insertInventorySchema = createInsertSchema(inventory);
export const insertAlertSchema = createInsertSchema(alerts);
export const insertConversationSchema = createInsertSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);

// ============================================
// TYPES
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Form = typeof forms.$inferSelect;
export type InsertForm = typeof forms.$inferInsert;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Dashboard Stats Type
export interface DashboardStats {
  todayBookings: number;
  upcomingBookings: number;
  pendingForms: number;
  lowStockItems: number;
  unreadAlerts: number;
  revenue: number;
}

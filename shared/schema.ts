import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// AUTH & USERS (Adapted from Replit Auth)
// ============================================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").default("staff").notNull(), // 'admin' or 'staff'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => [index("IDX_session_expire").on(table.expire)]);

// ============================================
// CHAT & COMMUNICATIONS (Adapted from Replit Chat)
// ============================================
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  contactId: integer("contact_id"), // Link conversation to a contact
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' (contact), 'assistant' (AI), 'agent' (human staff)
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ============================================
// CORE BUSINESS ENTITIES
// ============================================

// Contacts (Leads/Customers)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").default("new").notNull(), // new, active, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

// Services (What the business offers)
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in cents
  isActive: boolean("is_active").default(true),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled, no-show
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forms (Intake, Agreements)
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  contactId: integer("contact_id").references(() => contacts.id), // Can be standalone
  type: text("type").notNull(), // intake, agreement, feedback
  status: text("status").default("pending").notNull(), // pending, completed
  content: jsonb("content"), // The actual form data/answers
  sentAt: timestamp("sent_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
  sku: text("sku"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // low_stock, unconfirmed_booking, overdue_form, new_message
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"), // ID of the related entity (booking, inventory, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// RELATIONS
// ============================================
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  messages: many(messages),
  contact: one(contacts, {
    fields: [conversations.contactId],
    references: [contacts.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  contact: one(contacts, {
    fields: [bookings.contactId],
    references: [contacts.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
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

// ============================================
// SCHEMAS & TYPES
// ============================================

// Users & Auth
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = InsertUser; // Alias for auth module compatibility

// Contacts
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Services
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Bookings
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Forms
export const insertFormSchema = createInsertSchema(forms).omit({ id: true, sentAt: true, completedAt: true });
export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;

// Inventory
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventory.$inferSelect;

// Alerts
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Chat
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ============================================
// API TYPES
// ============================================
export type CreateContactRequest = InsertContact;
export type UpdateContactRequest = Partial<InsertContact>;

export type CreateServiceRequest = InsertService;
export type UpdateServiceRequest = Partial<InsertService>;

export type CreateBookingRequest = InsertBooking;
export type UpdateBookingRequest = Partial<InsertBooking>;

export type CreateFormRequest = InsertForm;
export type UpdateFormRequest = Partial<InsertForm>;

export type CreateInventoryRequest = InsertInventory;
export type UpdateInventoryRequest = Partial<InsertInventory>;

export type CreateAlertRequest = InsertAlert;
export type UpdateAlertRequest = Partial<InsertAlert>;

export interface DashboardStats {
  todayBookings: number;
  upcomingBookings: number;
  pendingForms: number;
  lowStockItems: number;
  unreadAlerts: number;
  revenue: number;
}

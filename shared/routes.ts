import { z } from 'zod';
import { 
  insertContactSchema, 
  insertServiceSchema, 
  insertBookingSchema, 
  insertFormSchema, 
  insertInventorySchema,
  insertAlertSchema,
  contacts,
  services,
  bookings,
  forms,
  inventory,
  alerts,
  users
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Contacts
  contacts: {
    list: {
      method: 'GET' as const,
      path: '/api/contacts' as const,
      responses: {
        200: z.array(z.custom<typeof contacts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/contacts/:id' as const,
      responses: {
        200: z.custom<typeof contacts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contacts' as const,
      input: insertContactSchema,
      responses: {
        201: z.custom<typeof contacts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/contacts/:id' as const,
      input: insertContactSchema.partial(),
      responses: {
        200: z.custom<typeof contacts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/contacts/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Services
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/services' as const,
      input: insertServiceSchema,
      responses: {
        201: z.custom<typeof services.$inferSelect>(),
      },
    },
  },

  // Bookings
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { contact?: typeof contacts.$inferSelect, service?: typeof services.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/:id' as const,
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id' as const,
      input: insertBookingSchema.partial(),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Forms
  forms: {
    list: {
      method: 'GET' as const,
      path: '/api/forms' as const,
      responses: {
        200: z.array(z.custom<typeof forms.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/forms' as const,
      input: insertFormSchema,
      responses: {
        201: z.custom<typeof forms.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/forms/:id' as const,
      input: insertFormSchema.partial(),
      responses: {
        200: z.custom<typeof forms.$inferSelect>(),
      },
    },
  },

  // Inventory
  inventory: {
    list: {
      method: 'GET' as const,
      path: '/api/inventory' as const,
      responses: {
        200: z.array(z.custom<typeof inventory.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/inventory' as const,
      input: insertInventorySchema,
      responses: {
        201: z.custom<typeof inventory.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/inventory/:id' as const,
      input: insertInventorySchema.partial(),
      responses: {
        200: z.custom<typeof inventory.$inferSelect>(),
      },
    },
  },

  // Alerts
  alerts: {
    list: {
      method: 'GET' as const,
      path: '/api/alerts' as const,
      responses: {
        200: z.array(z.custom<typeof alerts.$inferSelect>()),
      },
    },
    markRead: {
      method: 'PATCH' as const,
      path: '/api/alerts/:id/read' as const,
      input: z.object({}),
      responses: {
        200: z.custom<typeof alerts.$inferSelect>(),
      },
    },
  },
  
  // Dashboard
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          todayBookings: z.number(),
          upcomingBookings: z.number(),
          pendingForms: z.number(),
          lowStockItems: z.number(),
          unreadAlerts: z.number(),
          revenue: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

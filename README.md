# Care-Ops-Hub 🏥

A professional care management system built with modern web technologies. Manage bookings, contacts, inventory, and more with an intuitive, gradient-based UI.

**Live Demo:** [https://care-ops-hub.vercel.app](https://care-ops-hub.vercel.app)

---

## ✨ Features

### 🎯 Core Functionality
- **Dashboard** - Real-time analytics with KPIs, revenue charts, and recent bookings
- **Bookings Management** - Schedule and track service appointments
- **Contacts Management** - Manage client relationships with status tracking
- **Inventory Management** - Track supplies and equipment with low-stock alerts
- **Forms Management** - Create and manage custom feedback forms
- **Inbox** - Centralized messaging and notifications
- **Authentication** - Secure login with session management

### 🎨 Design & UX
- Professional gradient-based UI design
- Color-coded status indicators
- Responsive mobile-first layout
- Smooth animations and transitions
- Real-time data loading states
- Professional empty states

### 🔧 Technical Features
- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js with Passport authentication
- **State Management**: React Query for server state
- **Database**: Mock in-memory database (production-ready for PostgreSQL/SQLite integration)
- **Deployment**: Vercel-ready with auto-scaling
- **WebSocket**: Real-time communication support

---

## 🚀 Quick Start

### Prerequisites
- Node.js v22.0.0 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Tanya11225/Care-Ops-Hub.git
cd Care-Ops-Hub

# Install dependencies
npm install

# Build the frontend
npm run build

# Start the server
node index.js
```

The application will be available at **http://localhost:5000**

### Test Credentials
```
Email: admin@careops.com
Password: password
```

---

## 📁 Project Structure

```
Care-Ops-Hub/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── PageHeader.tsx # Consistent page headers
│   │   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   │   ├── StatsCard.tsx  # Reusable stat cards
│   │   │   └── ui/            # shadcn-ui components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx  # Main dashboard
│   │   │   ├── Bookings.tsx   # Booking management
│   │   │   ├── Contacts.tsx   # Contact management
│   │   │   ├── Forms.tsx      # Form management
│   │   │   ├── Inventory.tsx  # Inventory tracking
│   │   │   ├── Inbox.tsx      # Messages/notifications
│   │   │   └── AuthPage.tsx   # Login page
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-auth.ts    # Authentication hook
│   │   │   └── use-care-ops.ts # Business logic hook
│   │   ├── lib/               # Utilities and helpers
│   │   └── App.tsx            # Main app component
│   ├── tailwind.config.ts     # Tailwind CSS config
│   └── vite.config.ts         # Vite build config
├── server/                    # Backend server files
│   ├── index.ts               # TypeScript server definition
│   ├── auth.ts                # Authentication logic
│   └── routes.ts              # API routes
├── index.js                   # Main Express server
├── package.json               # Dependencies
└── vercel.json                # Vercel deployment config
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `GET /api/logout` - User logout

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Forms
- `GET /api/forms` - List all forms
- `POST /api/forms` - Create new form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Remove inventory

### Services
- `GET /api/services` - List available services

### Alerts
- `GET /api/alerts` - Get system alerts

---

## 🛠️ Development

### Available Scripts

```bash
# Build frontend and server
npm run build

# Start development server (requires manual build first)
node index.js

# Rebuild and watch for changes
npm run build -- --watch
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-secure-session-key
APP_URL=http://localhost:5000
```

For production (Vercel), configure these in your project settings.

---

## 🎨 Design System

### Color Scheme
- **Primary**: Gradient blues and purples
- **Success**: Emerald green for active states
- **Warning**: Amber for alerts
- **Error**: Red for critical issues
- **Neutral**: Slate for inactive states

### Components
- **StatsCard**: Color-coded metric display with trends
- **PageHeader**: Consistent page titles with actions
- **Sidebar**: Navigation with active state indicators
- **Dialogs**: Modal forms for data entry
- **Badges**: Status and category indicators

---

## 📊 Database Schema

### Users
```javascript
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  role: "admin" | "staff"
}
```

### Bookings
```javascript
{
  id: number,
  contactId: number,
  serviceId: number,
  startTime: Date,
  endTime: Date,
  status: "pending" | "confirmed" | "completed",
  price: number,
  notes: string
}
```

### Contacts
```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  address: string,
  status: "active" | "new" | "inactive",
  createdAt: Date
}
```

### Forms
```javascript
{
  id: number,
  title: string,
  description: string,
  fields: string[],
  isActive: boolean
}
```

### Inventory
```javascript
{
  id: number,
  name: string,
  quantity: number,
  lowStockThreshold: number,
  sku: string,
  category: string,
  unitPrice: number
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com/) and click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `SESSION_SECRET`: Your secure key
   - `NODE_ENV`: `production`
5. Click "Deploy"

The app will be live in minutes with automatic deployments on push!

### Other Deployment Options
- **Railway**: Full-stack deployment support
- **Render**: Free tier available
- **Heroku**: Traditional Node.js hosting

---

## 📱 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔐 Security Features

- ✅ Session-based authentication with Passport.js
- ✅ CSRF protection via express-session
- ✅ Environment variable configuration
- ✅ No sensitive data in version control
- ✅ Production-ready headers and middleware

---

## 📦 Dependencies

### Frontend
- `react` - UI framework
- `@tanstack/react-query` - Server state management
- `tailwindcss` - Utility-first CSS
- `shadcn-ui` - Component library
- `lucide-react` - Icon library
- `recharts` - Data visualization
- `date-fns` - Date utilities
- `wouter` - Client-side routing

### Backend
- `express` - Web server framework
- `passport` - Authentication middleware
- `express-session` - Session management
- `ws` - WebSocket support

---

## 🐛 Troubleshooting

### Port 5000 Already In Use
```bash
# Find and kill the process
Get-Process node | Stop-Process -Force
```

### Build Errors
```bash
# Clear and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### Session Not Working
- Ensure `SESSION_SECRET` is set in environment
- Clear browser cookies and try again
- Check that express-session is properly configured

---

## 📈 Performance Optimization

- Code splitting enabled in Vite
- Image optimization with lazy loading
- CSS purging for production builds
- Browser caching with proper headers
- WebSocket for real-time updates

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👨‍💻 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Contact the development team

---

## 🎉 Features Roadmap

- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] SMS integration
- [ ] Payment processing
- [ ] User role management
- [ ] Custom report generation
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Mobile app
- [ ] Calendar integration

---

## 📝 Changelog

### v1.0.0 (2026-02-13)
- ✅ Initial release
- ✅ Core booking management
- ✅ Contact management
- ✅ Inventory tracking
- ✅ Professional UI design
- ✅ Vercel deployment ready
- ✅ Authentication system

---

**Made with ❤️ for professional care management**

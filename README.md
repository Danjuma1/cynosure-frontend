# Cynosure Frontend

Modern, responsive React frontend for the Cynosure legal intelligence platform.

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **UI Components**: Headless UI

## Features

- 🎨 Modern, clean design with emerald green and charcoal palette
- 📱 Fully responsive across all devices
- 🔐 Complete authentication flow (login, signup, password reset)
- 📊 Interactive dashboard with real-time data
- 🔍 Advanced case search and filtering
- 📋 Cause list management with daily/upcoming views
- 👨‍⚖️ Judge and court directories
- 🔔 Real-time notifications via WebSocket
- ⚙️ User settings and preferences
- 🛡️ Admin dashboard for system management
- 🌙 Glassmorphism and micro-interactions

## Project Structure

\`\`\`
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components (Navbar, Sidebar)
│   ├── auth/            # Auth-specific components
│   ├── dashboard/       # Dashboard components
│   ├── cases/           # Case-related components
│   ├── courts/          # Court components
│   ├── judges/          # Judge components
│   ├── notifications/   # Notification components
│   ├── admin/           # Admin components
│   └── settings/        # Settings components
├── pages/
│   ├── auth/            # Authentication pages
│   ├── cases/           # Case pages
│   ├── courts/          # Court pages
│   ├── judges/          # Judge pages
│   ├── cause-lists/     # Cause list pages
│   ├── notifications/   # Notification pages
│   ├── admin/           # Admin pages
│   └── settings/        # Settings pages
├── hooks/               # Custom React hooks
├── services/
│   ├── api.js           # API service with axios
│   └── websocket.js     # WebSocket service
├── store/
│   ├── authStore.js     # Authentication state
│   └── notificationStore.js # Notification state
├── utils/
│   └── helpers.js       # Utility functions
├── styles/
│   └── index.css        # Global styles & Tailwind
├── App.jsx              # Main app component
└── main.jsx             # Entry point
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd cynosure-frontend
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Create environment file
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update environment variables
\`\`\`env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8001
\`\`\`

5. Start development server
\`\`\`bash
npm run dev
\`\`\`

The app will be available at http://localhost:3000

### Build for Production

\`\`\`bash
npm run build
\`\`\`

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Design System

### Colors

- **Primary**: Emerald Green (#0F5E3C)
- **Secondary**: Charcoal Black (#0D0D0D)
- **Neutrals**: White, soft greys

### Typography

- **Display Font**: Outfit
- **Body Font**: DM Sans
- **Mono Font**: JetBrains Mono

### Components

All components follow a consistent design language:

- **Buttons**: Primary, Secondary, Ghost, Danger, Outline variants
- **Cards**: With hover effects and glassmorphism option
- **Inputs**: With validation states and icons
- **Badges**: Status indicators with color variants
- **Tables**: Sortable with pagination
- **Modals**: Animated with backdrop
- **Tabs**: Multiple style variants

## API Integration

The frontend integrates with all backend API endpoints:

- **Authentication**: Login, signup, password reset, profile
- **Courts**: List, detail, follow/unfollow
- **Judges**: List, detail, availability
- **Cases**: Search, detail, timeline, hearings
- **Cause Lists**: Daily, upcoming, subscriptions
- **Notifications**: List, preferences, WebSocket updates
- **Admin**: Dashboard, analytics, user management

## Real-time Features

WebSocket connections for:
- Live cause list updates
- Instant notifications
- Status change alerts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License

# WebScrapper AI - Frontend

A modern, futuristic Next.js application for the WebScrapper AI platform. This frontend integrates with the Python backend to provide an intuitive interface for web scraping, AI-powered chat, and knowledge base management.

## Features

### 🏠 Landing Page
- Modern, animated hero section with gradient backgrounds
- Feature showcase with icons and descriptions
- How it works section with step-by-step guide
- Call-to-action sections

### 🔐 Authentication
- **Login Page**: Email/password authentication with remember me option
- **Signup Page**: User registration with password strength indicators
- JWT-based authentication with secure token storage

### 📊 Dashboard
- **Overview**: Stats cards showing collections, pages indexed, chat sessions, and active jobs
- **Real-time Updates**: Socket.IO integration for live progress updates
- **Quick Actions**: Easy access to create collections and start chats

### 📁 Collections Management
- **Create Collections**: Scrape any website with configurable depth and page limits
- **Live Progress**: Real-time crawling and embedding progress bars
- **Search**: Semantic search within collections
- **Status Tracking**: Visual indicators for pending, crawling, embedding, completed, and error states

### 💬 AI Chat
- **Conversational Interface**: Chat with your scraped data using AI
- **Multiple Sessions**: Create and manage multiple chat sessions per collection
- **Source Citations**: See exactly where answers come from
- **Real-time Responses**: Socket.IO powered live chat

### ⚙️ Settings
- Profile management
- Security settings
- Notification preferences
- Theme customization

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── chat/         # AI Chat interface
│   │   ├── collections/  # Collections management
│   │   └── settings/     # User settings
│   ├── login/            # Login page
│   ├── signup/           # Registration page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── landing/          # Landing page components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and services
│   ├── api.ts            # API client
│   ├── socket.ts         # Socket.IO manager
│   └── utils.ts          # Helper functions
├── store/                 # Zustand state stores
└── types/                 # TypeScript type definitions
```

## UI Components

The project includes a comprehensive UI component library:

- **Button**: Multiple variants (primary, secondary, ghost, danger, outline)
- **Card**: Glass morphism cards with hover effects
- **Input**: Styled inputs with icons and error states
- **Badge**: Status badges with pulse animations
- **Progress**: Gradient progress bars
- **Modal**: Animated modal dialogs
- **Spinner**: Loading indicators

## Design System

### Colors
- Primary: Sky blue (#0ea5e9)
- Accent: Cyan, Purple, Pink, Emerald
- Dark theme with glass morphism effects

### Effects
- Gradient backgrounds
- Blur/backdrop filters
- Glow shadows
- Smooth animations

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `GET /users/me` - Get current user

### Collections
- `POST /collections/` - Create collection and start scraping
- `GET /collections/` - List all collections
- `GET /collections/{id}` - Get collection details
- `DELETE /collections/{id}` - Delete collection

### Chat
- `POST /chat/sessions` - Create chat session
- `GET /chat/sessions/{collection_id}` - List sessions
- `POST /chat/message/{collection_id}/{session_id}` - Send message

### Real-time (Socket.IO)
- `join_job` / `leave_job` - Subscribe to job updates
- `progress` - Receive crawling progress
- `job_update` - Receive status updates
- `send_message` / `new_message` - Real-time chat

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

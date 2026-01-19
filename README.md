# IronPlate AI - Mobile-First Fitness PWA

Hyper-personalized workout and meal plans powered by Google Gemini AI. Offline-first Progressive Web App designed for gym-goers.

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with mobile-first breakpoints
- **UI Components**: Shadcn/UI, Lucide React icons
- **Backend/Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **AI Engine**: Google Gemini API
- **PWA**: next-pwa with offline support
- **Charts**: Recharts
- **Deployment**: Vercel

## Features

- ✅ Offline-first PWA with service worker caching
- ✅ Mobile-first responsive design with touch-friendly UI (44px minimum touch targets)
- ✅ AI-powered workout and meal plan generation
- ✅ Real-time workout tracking with rest timers
- ✅ Exercise swap system (3 per workout)
- ✅ Progress tracking (weight, PRs for bench/squat/deadlift)
- ✅ Smart grocery lists from meal plans
- ✅ Recipe generator from current ingredients
- ✅ Push notifications for workouts and progress logging

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and auth)
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jerichopogi/Iron-Plate-AI.git
cd ironplate-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GEMINI_API_KEY`: Your Google Gemini API key

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
ironplate-ai/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes (login, signup)
│   ├── (dashboard)/       # Main app routes (workout, meals, progress, profile)
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles and CSS variables
│   └── offline/           # Offline fallback page
├── components/            # React components
│   └── ui/                # Shadcn/UI components
├── lib/                   # Utility functions
│   └── utils.ts           # cn() helper for className merging
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   └── README-ICONS.md    # Instructions for adding app icons
├── next.config.ts         # Next.js + PWA configuration
├── tailwind.config.ts     # Tailwind CSS config with mobile-first breakpoints
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## PWA Configuration

### Service Worker Caching Strategies

- **API Calls** (Supabase, Gemini): Network-first with 10s timeout
- **Static Assets** (images, fonts, CSS, JS): Cache-first with 30-day expiration
- **Workout/Meal Plans**: Stale-while-revalidate for offline access
- **Offline Fallback**: Custom offline page

### Installing as PWA

1. Open the app in a mobile browser (Chrome, Safari, Edge)
2. Tap the browser menu
3. Select "Add to Home Screen" or "Install App"
4. The app will open in standalone mode without browser UI

## Mobile-First Design

### Breakpoints
- `sm`: 640px (small phones in landscape)
- `md`: 768px (tablets)
- `lg`: 1024px (small laptops)
- `xl`: 1280px (desktops)

### Touch Targets
All interactive elements have a minimum size of 44x44px for comfortable thumb navigation.

### Accessibility
- High contrast colors (WCAG AA compliant)
- Semantic HTML and ARIA labels
- Screen reader support
- Reduced motion support for animations

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key (server-side) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL (for redirects) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Development Roadmap

### ✅ Task 1: Project Setup (Current)
- Next.js 14+ with App Router
- PWA configuration
- Tailwind CSS with mobile-first breakpoints
- Shadcn/UI component library
- Environment variables template

### 🔄 Task 2: Supabase Integration (Next)
- Database schema setup
- Row Level Security (RLS) policies
- Authentication setup (Google OAuth + email/password)
- Realtime subscriptions

### 📋 Task 3: Smart Onboarding Wizard
- Multi-step form with progress indicator
- Profile data collection and validation
- Initial AI plan generation

### 📋 Task 4: AI Plan Generation Engine
- Google Gemini API integration
- Prompt engineering for workout/meal plans
- JSON parsing and validation
- Auto-regeneration on profile updates

### 📋 Task 5: Active Workout Dashboard
- Today's workout view
- Set tracking with checkboxes
- Rest timer
- Exercise swap system

### 📋 Task 6: Meal Planning & Grocery Lists
- Weekly meal plan display
- Smart grocery list generation
- Checkbox state persistence
- Recipe generator

### 📋 Task 7: Progress Tracking
- Weight logging
- PR tracking (bench, squat, deadlift)
- Trend graphs with Recharts
- Workout history

### 📋 Task 8: Push Notifications
- Service Worker notifications
- Workout reminders
- Weight logging reminders
- PR celebration notifications

## Adding Shadcn/UI Components

To add new Shadcn/UI components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
# etc.
```

Components will be added to `components/ui/` and can be imported:

```tsx
import { Button } from "@/components/ui/button"
```

## Testing PWA Locally

1. Build the production version:
```bash
npm run build
npm start
```

2. Open Chrome DevTools
3. Go to Application > Service Workers
4. Verify the service worker is registered
5. Go to Application > Manifest
6. Click "Add to Home Screen" to test installation

## License

This project is private and not licensed for public use.

## Support

For issues or questions, please open an issue on the GitHub repository.

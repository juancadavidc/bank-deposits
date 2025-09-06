# Bancolombia Balances Dashboard

A modern React dashboard application for analyzing banking transaction data and account balances. Built with Next.js 15, TypeScript, Supabase, and a comprehensive UI component library with real-time data processing capabilities.

## Features

### 📊 Interactive Charts & Visualizations
- **Balance Chart**: Track account balance trends over time
- **Transaction Chart**: Visualize daily transaction volumes
- **Daily Comparison**: Compare transaction patterns across different periods
- **Deposit Timeline**: Monitor deposit patterns and trends
- **Hourly Patterns**: Analyze transaction activity by hour of day
- **Top Senders**: View most frequent transaction sources

### 🔍 Advanced Filtering System
- **Date Range Picker**: Filter transactions by custom date ranges
- **Account Filter**: Filter by specific bank accounts
- **Status Filter**: Filter by transaction status (completed, pending, failed)
- **Search Filter**: Text-based search across transaction data

### 📱 Modern UI Components
- Responsive dashboard layout with metric cards
- Interactive transaction tables with sorting and pagination
- Modern component library built with shadcn/ui and Radix primitives
- Colombian peso formatting and localization
- Dark/light theme support ready

### 🏛️ Architecture
- **Database**: Supabase with PostgreSQL for real-time data storage
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **State Management**: Zustand for efficient state management
- **Real-time Updates**: Supabase real-time subscriptions
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Testing**: Jest and React Testing Library setup
- **Styling**: Tailwind CSS with custom animations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for database and authentication)
- Docker (optional, for local Supabase development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd balances-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Supabase project URL and anon key.

4. Set up the database:
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push database migrations
supabase db push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── charts/         # Chart components (Balance, Transaction, etc.)
│   ├── dashboard/      # Dashboard layout and components
│   ├── filters/        # Filter components
│   └── ui/            # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
│   ├── types.ts       # TypeScript type definitions
│   ├── supabase.ts    # Supabase client configuration
│   ├── mock-data.ts   # Mock data generation
│   ├── colombian-formatting.ts # Currency and date formatting
│   └── utils.ts       # General utilities
├── stores/             # Zustand state stores
└── migrations/         # Database schema migrations
```

## Key Technologies

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Library**: shadcn/ui + Radix UI primitives
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Testing**: Jest + React Testing Library
- **Code Formatting**: Prettier
- **Linting**: ESLint

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Component Development

The project follows a modular component architecture:

- **Chart Components**: Located in `src/components/charts/`
- **Dashboard Components**: Located in `src/components/dashboard/`
- **Filter Components**: Located in `src/components/filters/`
- **UI Components**: Base components in `src/components/ui/`

### Adding New Features

1. **Charts**: Add new chart components in `src/components/charts/`
2. **Filters**: Add new filter components in `src/components/filters/`
3. **Data Types**: Update type definitions in `src/lib/types.ts`
4. **Mock Data**: Extend mock data generation in `src/lib/mock-data.ts`

## Database Schema

The application uses the following database tables:

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'COP' NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(10) NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_time TIME NOT NULL,
  raw_message TEXT NOT NULL,
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  webhook_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'processed' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### Parse Errors Table
```sql
CREATE TABLE parse_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_message TEXT NOT NULL,
  error_reason TEXT NOT NULL,
  webhook_id VARCHAR(255) NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  resolved BOOLEAN DEFAULT FALSE NOT NULL
);
```

Both tables include:
- Row Level Security (RLS) policies
- Performance indexes for efficient querying
- Proper authentication and authorization controls

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

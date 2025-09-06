# Bancolombia Balances Dashboard

A modern React dashboard application for analyzing banking transaction data and account balances. Built with Next.js, TypeScript, and a comprehensive UI component library.

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
- **State Management**: Zustand for efficient state management
- **Mock Data**: Realistic banking data generation for development
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Testing**: Jest and React Testing Library setup
- **Styling**: Tailwind CSS with custom animations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

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

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

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
│   ├── mock-data.ts   # Mock data generation
│   ├── colombian-formatting.ts # Currency and date formatting
│   └── utils.ts       # General utilities
└── stores/             # Zustand state stores
```

## Key Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
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

## Data Format

The application expects transaction data in the following format:

```typescript
interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  account: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'income' | 'expense';
  sender?: string;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

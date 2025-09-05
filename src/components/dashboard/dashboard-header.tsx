import { APP_NAME } from '@/lib/constants';

export default function DashboardHeader() {
  return (
    <header className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-primary">
          {APP_NAME}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Monitor your incoming payments and analytics
        </p>
      </div>
    </header>
  );
}
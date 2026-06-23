import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - OrcaFácil',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      {children}
    </div>
  );
}

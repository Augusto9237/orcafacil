'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAppStore } from '@/store/useAppStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAppStore();

  useEffect(() => {
    if (!carregando && !usuario) {
      router.push('/login');
    }
  }, [usuario, carregando, router]);

  if (carregando || !usuario) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto  max-h-[100dvh] min-h-[100dvh]">
          {children}
        </main>
      </div>
    </div>
  );
}

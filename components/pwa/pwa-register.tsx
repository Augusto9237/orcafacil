'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    }

    // Capture install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show toast offering installation
      toast('Instalar Aplicativo', {
        description: 'Instale o app na sua tela inicial para acesso rápido e modo offline.',
        action: {
          label: 'Instalar',
          onClick: () => {
            (e as any).prompt();
            (e as any).userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] Usuário aceitou a instalação');
              }
              setDeferredPrompt(null);
            });
          },
        },
        duration: 8000,
        icon: <Download className="h-4 w-4 text-emerald-500" />,
      });
    };

    // Offline / Online status notifications
    const handleOffline = () => {
      toast.warning('Você está offline', {
        description: 'Algumas funcionalidades podem estar limitadas até a conexão retornar.',
        icon: <WifiOff className="h-4 w-4" />,
      });
    };

    const handleOnline = () => {
      toast.success('Conexão restabelecida', {
        description: 'Sua conexão com a internet foi restaurada.',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isStandalone || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden sm:block">
      <Button
        size="sm"
        variant="outline"
        className="shadow-lg border-emerald-500/50 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-2 text-xs font-medium"
        onClick={() => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
        }}
      >
        <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        Instalar App
      </Button>
    </div>
  );
}

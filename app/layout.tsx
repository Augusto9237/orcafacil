import '@/app/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { DataRefreshProvider } from '@/lib/data-refresh';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeColorStyle } from '@/components/theme-color-style';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PwaRegister } from '@/components/pwa/pwa-register';
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Sistema de Orçamentos e Serviços',
  description: 'Plataforma para gestão de clientes, produtos, serviços, orçamentos e ordens de serviço.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Orçamentos',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DataRefreshProvider>
            <AuthProvider>
              <ThemeColorStyle />
              <TooltipProvider>
                {children}
                <Toaster />
                <PwaRegister />
              </TooltipProvider>
            </AuthProvider>
          </DataRefreshProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, Package, Wrench, FileText, ClipboardList, Settings, LayoutDashboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';

const rotas = [
  { href: '/', icon: LayoutDashboard, titulo: 'Dashboard' },
  { href: '/clientes', icon: Users, titulo: 'Clientes' },
  { href: '/produtos', icon: Package, titulo: 'Produtos' },
  { href: '/servicos', icon: Wrench, titulo: 'Serviços' },
  { href: '/orcamentos', icon: FileText, titulo: 'Orçamentos' },
  { href: '/configuracoes', icon: Settings, titulo: 'Configurações' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { perfil } = useAuth();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight max-w-[190px] truncate" onClick={() => setIsOpen(false)}>
            {perfil?.logoUrl ? (
              <img 
                src={perfil.logoUrl} 
                alt="Logo" 
                className="h-8 w-8 rounded object-contain border bg-white dark:bg-zinc-900"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-primary text-primary-foreground h-8 w-8 rounded flex items-center justify-center font-bold">
                {(perfil?.empresa || 'O').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate">{perfil?.empresa || 'OrcaFácil'}</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] py-6 px-4">
          <nav className="flex flex-col gap-2">
            {rotas.map((rota) => (
              <Link 
                key={rota.href} 
                href={rota.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === rota.href 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <rota.icon className="h-4 w-4" />
                {rota.titulo}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}

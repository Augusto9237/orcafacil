import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <h1 className="text-4xl font-bold tracking-tight">404 - Página Não Encontrada</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        A página que você está procurando não existe ou foi movida.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  );
}

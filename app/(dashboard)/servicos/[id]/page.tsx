'use client';
import { useParams } from 'next/navigation';

export default function ServicoDetalhesPage() {
  const params = useParams();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Detalhes do Serviço</h2>
        <p className="text-muted-foreground">Visualizando serviço: {params?.id}</p>
      </div>
      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 p-6">
         <p className="text-muted-foreground text-sm">Página de detalhes em desenvolvimento.</p>
      </div>
    </div>
  );
}

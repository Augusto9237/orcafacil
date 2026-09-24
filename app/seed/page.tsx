'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { popularDadosIniciais } from '@/actions/seed';
import { useDataRefresh } from '@/lib/data-refresh';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SeedPage() {
  const { usuario } = useAuth();
  const { refresh } = useDataRefresh();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!usuario) {
      toast.error('Você precisa estar logado para popular o banco de dados.');
      return;
    }

    setIsSeeding(true);
    try {
      const resultado = await popularDadosIniciais(usuario.id);
      if (resultado.ok === false) {
        toast.error(resultado.error);
        return;
      }

      refresh();
      toast.success('Banco de dados populado com sucesso com dados da conta!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao popular o banco de dados.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Base de Dados (Seed)</h1>
      <p className="text-muted-foreground">
        Clique no botão abaixo para popular sua conta atual com clientes, produtos e serviços de teste. Isso irá inserir dados fictícios.
      </p>
      <Button onClick={handleSeed} disabled={isSeeding || !usuario}>
        {isSeeding ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
        Popular Dados Iniciais
      </Button>
    </div>
  );
}

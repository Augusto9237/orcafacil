'use client';
import { useState, useEffect } from 'react';
import { listarOrdensDeServico } from '@/actions/ordens-servico';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/lib/data-refresh';
import type { OrdemServico } from '@/types';

export function useOrdensDeServico() {
  const { usuario } = useAuth();
  const { version } = useDataRefresh();
  const [ordensDeServico, setOrdensDeServico] = useState<OrdemServico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
      setCarregando(false);
      setOrdensDeServico([]);
      return;
    }

    let ativo = true;
    setCarregando(true);

    listarOrdensDeServico(usuario.id)
      .then((dados) => {
        if (!ativo) return;
        setOrdensDeServico(dados);
        setErro(null);
      })
      .catch((err) => {
        if (!ativo) return;
        setErro(err.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [usuario, version]);

  return { ordensDeServico, carregando, erro };
}

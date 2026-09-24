'use client';
import { useState, useEffect } from 'react';
import { listarOrcamentos } from '@/actions/orcamentos';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/lib/data-refresh';
import type { Orcamento } from '@/types';

export function useOrcamentos() {
  const { usuario } = useAuth();
  const { version } = useDataRefresh();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
      setCarregando(false);
      setOrcamentos([]);
      return;
    }

    let ativo = true;
    setCarregando(true);

    listarOrcamentos(usuario.id)
      .then((dados) => {
        if (!ativo) return;
        setOrcamentos(dados);
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

  return { orcamentos, carregando, erro };
}

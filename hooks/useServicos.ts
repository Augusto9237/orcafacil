'use client';
import { useState, useEffect } from 'react';
import { listarServicos } from '@/actions/servicos';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/lib/data-refresh';
import type { Servico } from '@/types';

export function useServicos() {
  const { usuario } = useAuth();
  const { version } = useDataRefresh();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
      setCarregando(false);
      setServicos([]);
      return;
    }

    let ativo = true;
    setCarregando(true);

    listarServicos(usuario.id)
      .then((dados) => {
        if (!ativo) return;
        setServicos(dados);
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

  return { servicos, carregando, erro };
}

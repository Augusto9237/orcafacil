'use client';
import { useState, useEffect } from 'react';
import { listarProdutos } from '@/actions/produtos';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/lib/data-refresh';
import type { Produto } from '@/types';

export function useProdutos() {
  const { usuario } = useAuth();
  const { version } = useDataRefresh();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
      setCarregando(false);
      setProdutos([]);
      return;
    }

    let ativo = true;
    setCarregando(true);

    listarProdutos(usuario.id)
      .then((dados) => {
        if (!ativo) return;
        setProdutos(dados);
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

  return { produtos, carregando, erro };
}

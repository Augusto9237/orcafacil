'use client';
import { useState, useEffect } from 'react';
import { listarClientes } from '@/actions/clientes';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/lib/data-refresh';
import type { Cliente } from '@/types';

export function useClientes() {
  const { usuario } = useAuth();
  const { version } = useDataRefresh();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
      setCarregando(false);
      setClientes([]);
      return;
    }

    let ativo = true;
    setCarregando(true);

    listarClientes(usuario.id)
      .then((dados) => {
        if (!ativo) return;
        setClientes(dados);
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

  return { clientes, carregando, erro };
}

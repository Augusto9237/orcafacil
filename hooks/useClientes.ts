'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import type { Cliente } from '@/types';

export function useClientes() {
  const { usuario } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
       setCarregando(false);
       setClientes([]);
       return;
    }
    const q = query(
      collection(db, 'clientes'),
      where('usuarioId', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setClientes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cliente)));
        setCarregando(false);
        setErro(null);
      },
      (err) => {
        setErro(err.message);
        setCarregando(false);
      }
    );
    return () => unsubscribe();
  }, [usuario]);

  return { clientes, carregando, erro };
}

'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import type { Produto } from '@/types';

export function useProdutos() {
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
       setCarregando(false);
       setProdutos([]);
       return;
    }
    const q = query(
      collection(db, 'produtos'),
      where('usuarioId', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setProdutos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Produto)));
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

  return { produtos, carregando, erro };
}

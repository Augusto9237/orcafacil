'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import type { Orcamento } from '@/types';

export function useOrcamentos() {
  const { usuario } = useAuth();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
       setCarregando(false);
       setOrcamentos([]);
       return;
    }
    const q = query(
      collection(db, 'orcamentos'),
      where('usuarioId', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setOrcamentos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Orcamento)));
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

  return { orcamentos, carregando, erro };
}

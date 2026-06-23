'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import type { Servico } from '@/types';

export function useServicos() {
  const { usuario } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
       setCarregando(false);
       setServicos([]);
       return;
    }
    const q = query(
      collection(db, 'servicos'),
      where('usuarioId', '==', usuario.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setServicos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Servico)));
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

  return { servicos, carregando, erro };
}

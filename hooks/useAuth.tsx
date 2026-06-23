'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Usuario } from '@/types';

interface AuthContextType {
  usuario: User | null;
  perfil: Usuario | null;
  carregando: boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  atualizarPerfil: (dados: Partial<Usuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  perfil: null,
  carregando: true,
  loginGoogle: async () => {},
  logout: async () => {},
  atualizarPerfil: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribePerfil = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verifica se é o primeiro login e cria o doc
        const userDocRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          try {
            await setDoc(userDocRef, {
              id: user.uid,
              nome: user.displayName || 'Usuário Sem Nome',
              email: user.email,
              empresa: 'Minha Empresa',
              criadoEm: serverTimestamp()
            });
          } catch(e) {
             console.error("Erro ao criar usuário: ", e);
          }
        }

        // Se inscreve para atualizações em tempo real do perfil do usuário
        unsubscribePerfil = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setPerfil({ id: docSnap.id, ...docSnap.data() } as Usuario);
          }
        }, (err) => {
          console.error("Erro ao carregar perfil do Firestore: ", err);
        });
      } else {
        setPerfil(null);
        unsubscribePerfil();
      }
      setUsuario(user);
      setCarregando(false);
    });

    return () => {
      unsubscribe();
      unsubscribePerfil();
    };
  }, []);

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (error: any) {
      toast.error('Erro ao fazer login: ' + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
       toast.error('Erro ao sair da conta');
    }
  };

  const atualizarPerfil = async (dados: Partial<Usuario>) => {
    if (!usuario) {
      toast.error('Você precisa estar logado para atualizar as configurações');
      return;
    }
    try {
      const userDocRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userDocRef, dados);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao salvar configurações: ' + error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, perfil, carregando, loginGoogle, logout, atualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { authClient } from '@/lib/auth-client';
import { atualizarUsuario, garantirUsuario } from '@/actions/usuarios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Usuario } from '@/types';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

interface AuthContextType {
  usuario: AuthUser | null;
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
  const { data: session, isPending } = authClient.useSession();
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [sincronizandoPerfil, setSincronizandoPerfil] = useState(false);
  const router = useRouter();

  // Better Auth precisa de strictNullChecks para inferir Session; tipamos manualmente.
  const usuario = (session as { user: AuthUser } | null | undefined)?.user ?? null;
  const carregando = isPending || sincronizandoPerfil;

  useEffect(() => {
    let cancelado = false;

    async function sincronizarPerfil() {
      if (!usuario) {
        setPerfil(null);
        setSincronizandoPerfil(false);
        return;
      }

      setSincronizandoPerfil(true);
      try {
        const perfilAtual = await garantirUsuario({
          id: usuario.id,
          nome: usuario.name || 'Usuário Sem Nome',
          email: usuario.email || '',
        });
        if (!cancelado) {
          setPerfil(perfilAtual);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil: ', error);
        if (!cancelado) {
          setPerfil(null);
        }
      } finally {
        if (!cancelado) {
          setSincronizandoPerfil(false);
        }
      }
    }

    sincronizarPerfil();
    return () => {
      cancelado = true;
    };
  }, [usuario?.id, usuario?.name, usuario?.email]);

  const loginGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao fazer login: ' + message);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch {
      toast.error('Erro ao sair da conta');
    }
  };

  const atualizarPerfil = async (dados: Partial<Usuario>) => {
    if (!usuario) {
      toast.error('Você precisa estar logado para atualizar as configurações');
      return;
    }
    try {
      const resultado = await atualizarUsuario(usuario.id, dados);
      if (resultado.ok === false) {
        toast.error(resultado.error);
        return;
      }
      setPerfil(resultado.data);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao atualizar configurações:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao salvar configurações: ' + message);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, perfil, carregando, loginGoogle, logout, atualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

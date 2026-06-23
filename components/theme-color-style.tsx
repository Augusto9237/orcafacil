'use client';
import { useAuth } from '@/hooks/useAuth';

export const TEMAS_DISPONIVEIS = [
  { id: 'padrao', nome: 'Padrão (Slate)', cor: '#18181b', primary: 'oklch(0.488 0.243 264.376)', textClass: 'text-zinc-900 dark:text-zinc-50' },
  { id: 'azul', nome: 'Azul Lápis-Lazúli', cor: '#2563eb', primary: 'oklch(0.505 0.203 245)', textClass: 'text-blue-600' },
  { id: 'esmeralda', nome: 'Verde Esmeralda', cor: '#059669', primary: 'oklch(0.52 0.17 145)', textClass: 'text-emerald-600' },
  { id: 'violeta', nome: 'Roxo Violeta', cor: '#7c3aed', primary: 'oklch(0.51 0.21 292)', textClass: 'text-violet-600' },
  { id: 'terracota', nome: 'Laranja Terracota', cor: '#ea580c', primary: 'oklch(0.55 0.19 50)', textClass: 'text-orange-600' },
  { id: 'carmim', nome: 'Vermelho Carmim', cor: '#dc2626', primary: 'oklch(0.53 0.19 18)', textClass: 'text-red-600' },
];

export function ThemeColorStyle() {
  const { perfil } = useAuth();
  
  if (!perfil?.corTema) {
    return null;
  }
  
  const selectedTheme = TEMAS_DISPONIVEIS.find(t => t.id === perfil.corTema);
  if (!selectedTheme || selectedTheme.id === 'padrao') {
    return null;
  }
  
  const pColor = selectedTheme.primary;
  
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --primary: ${pColor} !important;
          --primary-foreground: oklch(0.985 0 0) !important;
          --sidebar-primary: ${pColor} !important;
          --sidebar-primary-foreground: oklch(0.985 0 0) !important;
          --ring: ${pColor} !important;
        }
        .dark {
          --primary: ${pColor} !important;
          --primary-foreground: oklch(0.985 0 0) !important;
          --sidebar-primary: ${pColor} !important;
          --sidebar-primary-foreground: oklch(0.985 0 0) !important;
          --ring: ${pColor} !important;
        }
      `
    }} />
  );
}

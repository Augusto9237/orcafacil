'use client';
import { useAuth } from '@/hooks/useAuth';

export const TEMAS_DISPONIVEIS = [
  { id: 'zinc', nome: 'Zinc', cor: '#18181b', primary: 'oklch(0.205 0 0)', primaryDark: 'oklch(0.985 0 0)', textClass: 'text-zinc-950 dark:text-zinc-50' },
  { id: 'slate', nome: 'Slate', cor: '#64748b', primary: 'oklch(0.205 0.012 264.376)', primaryDark: 'oklch(0.985 0.012 264.376)', textClass: 'text-slate-900 dark:text-slate-50' },
  { id: 'stone', nome: 'Stone', cor: '#78716c', primary: 'oklch(0.205 0.005 70)', primaryDark: 'oklch(0.985 0.005 70)', textClass: 'text-stone-900 dark:text-stone-50' },
  { id: 'gray', nome: 'Gray', cor: '#6b7280', primary: 'oklch(0.205 0.005 240)', primaryDark: 'oklch(0.985 0.005 240)', textClass: 'text-gray-900 dark:text-gray-50' },
  { id: 'neutral', nome: 'Neutral', cor: '#737373', primary: 'oklch(0.205 0 0)', primaryDark: 'oklch(0.985 0 0)', textClass: 'text-neutral-900 dark:text-neutral-50' },
  { id: 'violeta', nome: 'Violet', cor: '#7c3aed', primary: 'oklch(0.505 0.213 292.5)', primaryDark: 'oklch(0.655 0.205 292.5)', textClass: 'text-violet-600' },
  { id: 'azul', nome: 'Blue', cor: '#2563eb', primary: 'oklch(0.505 0.203 245)', primaryDark: 'oklch(0.655 0.175 245)', textClass: 'text-blue-600' },
  { id: 'esmeralda', nome: 'Emerald', cor: '#059669', primary: 'oklch(0.52 0.17 145)', primaryDark: 'oklch(0.67 0.16 145)', textClass: 'text-emerald-600' },
  { id: 'verde', nome: 'Green', cor: '#16a34a', primary: 'oklch(0.525 0.163 145)', primaryDark: 'oklch(0.675 0.155 145)', textClass: 'text-green-600' },
  { id: 'terracota', nome: 'Orange', cor: '#ea580c', primary: 'oklch(0.555 0.195 50)', primaryDark: 'oklch(0.705 0.185 50)', textClass: 'text-orange-600' },
  { id: 'amber', nome: 'Amber', cor: '#d97706', primary: 'oklch(0.605 0.165 75)', primaryDark: 'oklch(0.755 0.155 75)', textClass: 'text-amber-600' },
  { id: 'amarelo', nome: 'Yellow', cor: '#ca8a04', primary: 'oklch(0.655 0.15 85)', primaryDark: 'oklch(0.805 0.135 85)', textClass: 'text-yellow-600' },
  { id: 'carmim', nome: 'Red', cor: '#dc2626', primary: 'oklch(0.515 0.202 25)', primaryDark: 'oklch(0.665 0.185 25)', textClass: 'text-red-600' },
  { id: 'rose', nome: 'Rose', cor: '#e11d48', primary: 'oklch(0.525 0.225 15)', primaryDark: 'oklch(0.675 0.211 15)', textClass: 'text-rose-600' },
];

export function ThemeColorStyle() {
  const { perfil } = useAuth();
  
  if (!perfil?.corTema) {
    return null;
  }
  
  const themeId = perfil.corTema === 'padrao' ? 'zinc' : perfil.corTema;
  const selectedTheme = TEMAS_DISPONIVEIS.find(t => t.id === themeId);
  if (!selectedTheme) {
    return null;
  }
  
  const pColor = selectedTheme.primary;
  const pDarkColor = selectedTheme.primaryDark || pColor;
  
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
          --primary: ${pDarkColor} !important;
          --primary-foreground: oklch(0.145 0 0) !important;
          --sidebar-primary: ${pDarkColor} !important;
          --sidebar-primary-foreground: oklch(0.145 0 0) !important;
          --ring: ${pDarkColor} !important;
        }
      `
    }} />
  );
}

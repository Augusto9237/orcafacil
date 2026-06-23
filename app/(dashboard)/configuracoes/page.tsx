'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TEMAS_DISPONIVEIS } from '@/components/theme-color-style';
import { Building2, FileText, Phone, MapPin, Eye, Palette, Upload, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_LOGOS = [
  { name: 'Aurora', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80' },
  { name: 'Spectrum', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80' },
  { name: 'Flux', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=120&q=80' },
  { name: 'Symmetry', url: 'https://images.unsplash.com/photo-1618005198143-e52834643503?auto=format&fit=crop&w=120&q=80' },
];

export default function ConfiguracoesPage() {
  const { perfil, atualizarPerfil, carregando: carregandoAuth } = useAuth();
  
  const [empresa, setEmpresa] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [corTema, setCorTema] = useState('zinc');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (perfil) {
      setEmpresa(perfil.empresa || '');
      setCnpjCpf(perfil.cnpjCpf || '');
      setTelefone(perfil.telefone || '');
      setEndereco(perfil.endereco || '');
      setLogoUrl(perfil.logoUrl || '');
      
      const temaAtual = perfil.corTema || 'zinc';
      setCorTema(temaAtual === 'padrao' ? 'zinc' : temaAtual);
    }
  }, [perfil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await atualizarPerfil({
        empresa,
        cnpjCpf,
        telefone,
        endereco,
        logoUrl,
        corTema,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectTheme = async (themeId: string) => {
    setCorTema(themeId);
    try {
      await atualizarPerfil({ corTema: themeId });
      toast.success(`Tema alterado com sucesso!`);
    } catch (err) {
      toast.error('Erro ao salvar tema');
    }
  };

  if (carregandoAuth) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Configurações</h2>
        <p className="text-muted-foreground text-xs md:text-sm">Personalize os dados e a identidade visual da sua empresa para orçamentos.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Formulários de Configurações */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Dados da Empresa */}
          <Card className="border shadow-sm bg-white dark:bg-zinc-950">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Building2 className="h-4 w-4 text-primary" />
                Dados da Empresa
              </CardTitle>
              <CardDescription className="text-xs">
                Estas informações serão visíveis nos PDFs de orçamento emitidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="empresa">Nome / Razão Social</Label>
                  <Input
                    id="empresa"
                    placeholder="Ex: Minha Empresa LTDA"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cnpjCpf">CNPJ ou CPF</Label>
                  <Input
                    id="cnpjCpf"
                    placeholder="Ex: 00.000.000/0001-00"
                    value={cnpjCpf}
                    onChange={(e) => setCnpjCpf(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone para Contato</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="telefone"
                    className="pl-9"
                    placeholder="Ex: (11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endereco">Endereço Comercial</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="endereco"
                    className="pl-9"
                    placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Logotipo */}
          <Card className="border shadow-sm bg-white dark:bg-zinc-950">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Sparkles className="h-4 w-4 text-primary" />
                Logotipo da Empresa
              </CardTitle>
              <CardDescription className="text-xs">
                Customize o logo de exibição. Insira um link direto de imagem ou escolha um preset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="logoUrl">URL do Logotipo</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://exemplo.com/sua-logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Ou escolha uma logo artística de demonstração:</Label>
                <div className="grid grid-cols-4 gap-3">
                  {SAMPLE_LOGOS.map((logo) => (
                    <button
                      key={logo.name}
                      type="button"
                      onClick={() => {
                        setLogoUrl(logo.url);
                        toast.info(`Logo "${logo.name}" selecionado!`);
                      }}
                      className={`relative group rounded-md border p-1 bg-zinc-50 dark:bg-zinc-900 transition-all ${
                        logoUrl === logo.url 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <img 
                        src={logo.url} 
                        alt={logo.name} 
                        className="h-10 w-full rounded object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-[10px] text-center mt-1 truncate text-zinc-500 dark:text-zinc-400 font-medium pb-0.5">
                        {logo.name}
                      </div>
                      {logoUrl === logo.url && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="h-2 w-2" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Cores do Tema */}
          <Card className="border shadow-sm bg-white dark:bg-zinc-950">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Palette className="h-4 w-4 text-primary" />
                Cores do Tema do Sistema
              </CardTitle>
              <CardDescription className="text-xs">
                Altere a cor de destaque da interface. O tema é sincronizado na nuvem e atualiza em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEMAS_DISPONIVEIS.map((tema) => (
                  <button
                    key={tema.id}
                    type="button"
                    onClick={() => handleSelectTheme(tema.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs font-semibold tracking-tight transition-all ${
                      corTema === tema.id
                        ? 'border-primary bg-zinc-50 dark:bg-zinc-900 ring-2 ring-primary/10'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 bg-white dark:bg-zinc-950'
                    }`}
                  >
                    <span 
                      className="h-4 w-4 rounded-full border shadow-sm shrink-0" 
                      style={{ backgroundColor: tema.cor }}
                    />
                    <span className="truncate text-zinc-800 dark:text-zinc-200 leading-none">
                      {tema.nome}
                    </span>
                    {corTema === tema.id && (
                      <Check className="h-3.5 w-3.5 ml-auto text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botão de Form Submission */}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="font-semibold shadow px-6">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>

        {/* Simulador / Preview Lado-Lado */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-md bg-white dark:bg-zinc-950 sticky top-24 overflow-hidden border-zinc-200/90 dark:border-zinc-800/90">
            <CardHeader className="">
              <CardTitle className="font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Eye className="h-4 w-4" />
                Live Preview de Orçamentos
              </CardTitle>
              <CardDescription className="text-[11px]">
                Demonstração de como os dados e logo aparecem nos relatórios PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 font-sans">
              <div className="border rounded-md p-4 bg-white text-zinc-900 space-y-4 shadow-sm relative overflow-hidden dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800/80">
                
                {/* Dynamic Primary Color Accent Bar Mockup */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                
                {/* Mock Header Layout */}
                <div className="flex justify-between items-start pt-1 gap-2">
                  <div className="space-y-1 max-w-[60%]">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo Preview" 
                        className="h-10 max-w-[100px] object-contain rounded border bg-zinc-50 dark:bg-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="bg-zinc-100 text-zinc-500 rounded p-1 text-[10px] uppercase font-bold tracking-wider float-left border border-dashed text-center">
                        Sem Logotipo
                      </div>
                    )}
                    <div className="clear-both pt-2">
                      <h4 className="text-xs font-bold truncate leading-tight">
                        {empresa || 'Nome da Sua Empresa'}
                      </h4>
                      {cnpjCpf && (
                        <p className="text-[9px] text-zinc-400 font-mono tracking-tight">CNPJ: {cnpjCpf}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Mock Doc metadata */}
                  <div className="text-right space-y-0.5">
                    <span className="inline-block bg-primary/10 text-primary uppercase text-[8px] font-extrabold px-1.5 py-0.5 rounded">
                      ORÇAMENTO
                    </span>
                    <p className="text-[9px] font-mono text-zinc-400 leading-none mt-1">Nº #0024</p>
                    <p className="text-[9px] font-mono text-zinc-400">Data: 22/06/2026</p>
                  </div>
                </div>

                <div className="border-t border-dashed my-3" />

                {/* Mock Client Layout */}
                <div className="grid grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-400 block uppercase tracking-wider">Emitido de:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{empresa || '—'}</p>
                    <p className="text-zinc-400 text-[9px] truncate">{telefone || '—'}</p>
                    <p className="text-zinc-400 text-[9px] truncate">{endereco || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-zinc-400 block uppercase tracking-wider">Destinado a:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">João Silva S/A</p>
                    <p className="text-zinc-400 text-[9px]">(11) 98765-4321</p>
                    <p className="text-zinc-400 text-[9px] truncate">Av. Brigadeiro Luis Antonio, 500</p>
                  </div>
                </div>

                <div className="border-t my-3" />

                {/* Mock Item Row */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wide px-1">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  <div className="flex justify-between text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded border border-zinc-100 dark:border-zinc-800/40">
                    <div className="space-y-0.5 max-w-[70%]">
                      <p className="font-medium truncate text-zinc-900 dark:text-zinc-50">01. Prestação de Serviços Técnicos</p>
                      <p className="text-[9px] text-zinc-400">Suporte técnico de TI e configuração de rede</p>
                    </div>
                    <span className="font-mono font-bold self-center text-primary">R$ 450,00</span>
                  </div>
                </div>

                {/* Mock Sign block */}
                <div className="pt-2 flex flex-col items-center justify-center space-y-1">
                  <div className="w-24 border-b border-zinc-300 dark:border-zinc-700 h-6" />
                  <span className="text-[8px] text-zinc-400 text-center uppercase tracking-wider block">
                    Por: {empresa || 'Sua Empresa'}
                  </span>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

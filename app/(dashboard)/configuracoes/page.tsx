'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TEMAS_DISPONIVEIS } from '@/components/theme-color-style';
import { Building2, FileText, Phone, MapPin, Eye, Palette, Upload, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const { perfil, atualizarPerfil, carregando: carregandoAuth } = useAuth();
  
  const [empresa, setEmpresa] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [corTema, setCorTema] = useState('zinc');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

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

  const handleCancel = () => {
    if (perfil) {
      setEmpresa(perfil.empresa || '');
      setCnpjCpf(perfil.cnpjCpf || '');
      setTelefone(perfil.telefone || '');
      setEndereco(perfil.endereco || '');
      setLogoUrl(perfil.logoUrl || '');
      const temaAtual = perfil.corTema || 'zinc';
      setCorTema(temaAtual === 'padrao' ? 'zinc' : temaAtual);
      toast.info('Alterações descartadas.');
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
    <div className="space-y-6 pt-12">
      <div>
        <h2 className="text-2xl max-sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Configurações</h2>
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
            <CardFooter className="flex items-center justify-end gap-2 border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                id="btn-cancelar-card-empresa"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting} 
                className="font-semibold shadow"
                id="btn-salvar-card-empresa"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Logotipo */}
          <Card className="border shadow-sm bg-white dark:bg-zinc-950">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Sparkles className="h-4 w-4 text-primary" />
                Logotipo da Empresa
              </CardTitle>
              <CardDescription className="text-xs">
                Customize o logo de exibição. Insira um link direto de imagem para a sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Preview da Logo (Primeiro) */}
                <div className="relative shrink-0 flex flex-col items-center gap-1">
                  <div className="h-20 w-20 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden p-1 shadow-sm">
                    {logoUrl.trim() !== '' && !logoError ? (
                      <img 
                        src={logoUrl} 
                        alt="Preview do Logotipo" 
                        className="max-h-full max-w-full object-contain rounded"
                        referrerPolicy="no-referrer"
                        onError={() => setLogoError(true)}
                      />
                    ) : logoUrl.trim() !== '' && logoError ? (
                      <div className="text-[10px] text-rose-500 font-medium text-center px-1">
                        Erro na imagem
                      </div>
                    ) : (
                      <Building2 className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Preview</span>
                </div>

                {/* Input da URL (Ao lado) */}
                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="logoUrl" className="text-xs font-semibold">URL do Logotipo</Label>
                    {logoUrl.trim() !== '' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"
                        onClick={() => {
                          setLogoUrl('');
                          setLogoError(false);
                        }}
                      >
                        Remover URL
                      </Button>
                    )}
                  </div>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://exemplo.com/sua-logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  {logoError && logoUrl.trim() !== '' && (
                    <p className="text-[11px] text-rose-500">
                      Não foi possível carregar a imagem da URL fornecida.
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Link direto da imagem do logotipo para relatórios e documentos.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2 border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                id="btn-cancelar-card-logo"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting} 
                className="font-semibold shadow"
                id="btn-salvar-card-logo"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardFooter>
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
            <CardFooter className="flex items-center justify-end gap-2 border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                id="btn-cancelar-card-tema"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting} 
                className="font-semibold shadow"
                id="btn-salvar-card-tema"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardFooter>
          </Card>


        </form>

        {/* Simulador / Preview Lado-Lado */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-md bg-white dark:bg-zinc-950 top-24 overflow-hidden border-zinc-200/90 dark:border-zinc-800/90">
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

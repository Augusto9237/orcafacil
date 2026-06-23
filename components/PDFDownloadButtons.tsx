'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OrcamentoPDF } from './OrcamentoPDF';
import { OrdemServicoPDF } from './OrdemServicoPDF';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import type { Orcamento, OrdemServico, Usuario } from '@/types';

interface DownloadOrcamentoButtonProps {
  orcamento: Orcamento;
  empresa: Usuario | null;
}

export function DownloadOrcamentoButton({ orcamento, empresa }: DownloadOrcamentoButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="default" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<OrcamentoPDF orcamento={orcamento} empresa={empresa} />}
      fileName={`Orcamento-${orcamento.numero || orcamento.id}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ loading, error }) => {
        if (loading) {
          return (
            <Button disabled variant="default" className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Gerando PDF...
            </Button>
          );
        }
        if (error) {
          console.error("Erro PDF: ", error);
          return (
            <Button variant="destructive" className="gap-2">
              Erro ao Gerar PDF
            </Button>
          );
        }
        return (
          <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700 font-semibold cursor-pointer">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}

interface DownloadOSButtonProps {
  ordemServico: OrdemServico;
  empresa: Usuario | null;
}

export function DownloadOSButton({ ordemServico, empresa }: DownloadOSButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="default" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<OrdemServicoPDF ordemServico={ordemServico} empresa={empresa} />}
      fileName={`OS-${ordemServico.numero || ordemServico.id}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ loading, error }) => {
        if (loading) {
          return (
            <Button disabled variant="default" className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Gerando PDF...
            </Button>
          );
        }
        if (error) {
          console.error("Erro PDF OS: ", error);
          return (
            <Button variant="destructive" className="gap-2">
              Erro ao Gerar PDF
            </Button>
          );
        }
        return (
          <Button variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-semibold cursor-pointer">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}

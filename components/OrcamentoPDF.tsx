'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Rect, Image } from '@react-pdf/renderer';
import type { Orcamento, Usuario } from '@/types';

// Define layout style rules based on reference model (black and white printable grid layout)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    lineHeight: 1.3,
    paddingTop: 25,
    paddingHorizontal: 40,
    paddingBottom: 40,
    color: '#000000',
  },
  // Top metadata right aligned
  topMetaContainer: {
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  topPageNum: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  topDocNumber: {
    fontSize: 8,
    marginTop: 2,
  },
  // Header section (logo left, info centered)
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
  },
  logoContainer: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 60,
    height: 40,
    objectFit: 'contain',
  },
  logoBrandText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 3,
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 5.5,
    color: '#555555',
    textAlign: 'center',
    marginTop: 1,
  },
  companyDetailsCentered: {
    width: '75%',
    textAlign: 'center',
    paddingRight: 20,
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  companySub: {
    fontSize: 8,
    marginBottom: 2,
  },
  // Title
  documentTitleContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  documentTitleText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  // Client details block
  clientSection: {
    marginBottom: 12,
  },
  clientRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  clientLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    width: 65,
  },
  clientValue: {
    fontSize: 8.5,
    flex: 1,
  },
  // Row blocks with columns
  clientGridRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  // Helper columns widths to align with reference layout
  colCEP: { width: '25%', flexDirection: 'row' },
  colCidade: { width: '45%', flexDirection: 'row' },
  colBairro: { width: '30%', flexDirection: 'row' },
  colEmail: { width: '50%', flexDirection: 'row' },
  colTelefone: { width: '30%', flexDirection: 'row' },
  colEstado: { width: '20%', flexDirection: 'row' },
  colCPF: { width: '45%', flexDirection: 'row' },
  colRG: { width: '30%', flexDirection: 'row' },
  colCelular: { width: '25%', flexDirection: 'row' },
  
  gridLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
  },
  gridValue: {
    fontSize: 8.5,
  },
  // Divider before items
  itensDivider: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 2,
    alignItems: 'center',
    marginVertical: 12,
  },
  itensDividerText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  // Table Section
  table: {
    borderWidth: 1,
    borderColor: '#000000',
    width: '100%',
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    alignItems: 'center',
  },
  colDesc: {
    width: '70%',
    padding: 5,
    fontSize: 8.5,
  },
  colValUnit: {
    width: '15%',
    padding: 5,
    textAlign: 'right',
    fontSize: 8.5,
    borderLeftWidth: 1,
    borderLeftColor: '#000000',
  },
  colValTotal: {
    width: '15%',
    padding: 5,
    textAlign: 'right',
    fontSize: 8.5,
    borderLeftWidth: 1,
    borderLeftColor: '#000000',
  },
  headerText: {
    fontFamily: 'Helvetica-Bold',
  },
  rowItemText: {
    fontFamily: 'Helvetica',
  },
  // Totals Box aligned with the end cols (15% + 15% = 30%)
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  totalsBlock: {
    width: '30%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    alignItems: 'center',
  },
  totalRowFinal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    padding: 4,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  totalValue: {
    padding: 4,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    width: '50%',
  },
  // Notes / Observations block
  observacoesBox: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 5,
    marginTop: 15,
  },
  observacoesHeader: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  observacoesText: {
    fontSize: 8.5,
    lineHeight: 1.3,
  },
});

interface EnderecoDecomposto {
  logradouro: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Decomposition parser function to structure address details gracefully as in the image template
function decomporEndereco(enderecoStr?: string): EnderecoDecomposto {
  const result: EnderecoDecomposto = {
    logradouro: '—',
    numero: '—',
    cep: '—',
    bairro: '—',
    cidade: '—',
    estado: '—'
  };

  if (!enderecoStr) return result;

  // Split components by comma
  const parts = enderecoStr.split(',').map(p => p.trim());

  // Detect CEP (5 digits, optional dash, 3 digits) and State (2 upper letters) using regex
  const cepRegex = /\b\d{5}-?\d{3}\b/;
  const stateRegex = /\b([A-Z]{2})\b/;

  const cepMatch = enderecoStr.match(cepRegex);
  if (cepMatch) {
    result.cep = cepMatch[0];
  }

  const stateMatch = enderecoStr.match(stateRegex);
  if (stateMatch) {
    result.estado = stateMatch[1];
  }

  if (parts.length >= 5) {
    result.logradouro = parts[0] || '—';
    result.numero = parts[1] || '—';
    
    if (result.cep === '—' && cepRegex.test(parts[2])) {
      result.cep = parts[2];
    }
    
    result.cidade = parts[3] || '—';
    if (result.cidade.length > 2 && result.cidade.includes(' - ')) {
      result.cidade = result.cidade.split(' - ')[0];
    }

    if (result.estado === '—') {
      result.estado = parts[4] || '—';
    }
    
    if (parts.length >= 6) {
      result.bairro = parts[5];
    } else if (!cepRegex.test(parts[2]) && parts[2] !== result.cep) {
      result.bairro = parts[2];
    }
  } else if (parts.length === 4) {
    result.logradouro = parts[0];
    result.numero = parts[1];
    result.cidade = parts[2];
    if (result.estado === '—') {
      result.estado = parts[3];
    }
  } else if (parts.length === 3) {
    result.logradouro = parts[0];
    if (parts[1] && /^\d+$/.test(parts[1])) {
      result.numero = parts[1];
      result.cidade = parts[2];
    } else {
      result.cidade = parts[1];
      if (result.estado === '—') {
        result.estado = parts[2];
      }
    }
  } else {
    result.logradouro = enderecoStr;
  }

  // Clean prefix keywords
  if (result.logradouro) result.logradouro = result.logradouro.replace(/( CEP| CEP:).*$/gi, '').trim();
  if (result.cidade) result.cidade = result.cidade.replace(/^(Cidade:?|City:?)\s*/i, '').trim();
  if (result.estado) result.estado = result.estado.replace(/^(Estado:?|UF:?)\s*/i, '').trim();
  if (result.cep) result.cep = result.cep.replace(/^(CEP:?)\s*/i, '').trim();
  if (result.bairro) result.bairro = result.bairro.replace(/^(Bairro:?)\s*/i, '').trim();

  return result;
}

interface OrcamentoPDFProps {
  orcamento: Orcamento;
  empresa: Usuario | null;
}

export function OrcamentoPDF({ orcamento, empresa }: OrcamentoPDFProps) {
  const dataCriacao = orcamento.criadoEm 
    ? (orcamento.criadoEm instanceof Date 
        ? orcamento.criadoEm 
        : (orcamento.criadoEm as any).toDate?.() || new Date(orcamento.criadoEm as any))
    : new Date();

  const formattedDate = dataCriacao.toLocaleDateString('pt-BR');
  
  // Format currency helpers for Portuguese
  const formatCurrency = (val: number) => {
    return 'R$ ' + Number(val).toFixed(2).replace('.', ',');
  };

  // Parse client address details
  const decomposto = decomporEndereco(orcamento.cliente.endereco);

  // Calculate clean numeric value for discount
  const getValorDesconto = () => {
    if (orcamento.desconto <= 0) return 0;
    if (orcamento.descontoTipo === 'percentual') {
      return (orcamento.subtotal * orcamento.desconto) / 100;
    }
    return orcamento.desconto;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top Right Page Metadata */}
        <View style={styles.topMetaContainer}>
          <Text style={styles.topPageNum} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages || 1}`} />
          <Text style={styles.topDocNumber}>Número: {orcamento.numero || '—'}</Text>
        </View>

        {/* Master Header */}
        <View style={styles.headerContainer}>
          {/* Logo Block */}
          <View style={styles.logoContainer}>
            {empresa?.logoUrl ? (
              <Image src={empresa.logoUrl} style={styles.logoImage} />
            ) : (
              <>
                <Svg width={30} height={24} viewBox="0 0 100 80">
                  <Path 
                    d="M 50 10 C 25 10 25 40 25 45 C 25 55 50 75 50 75 C 50 75 75 55 75 45 C 75 40 75 10 50 10 Z" 
                    fill="none" 
                    stroke="#000000" 
                    strokeWidth="5" 
                  />
                  <Path 
                    d="M 35 45 Q 50 35 65 45 C 65 45 65 52 65 52 L 35 52 Z" 
                    fill="#000000" 
                  />
                  <Rect x={47} y={26} width={6} height={12} fill="#000000" />
                </Svg>
                <Text style={styles.logoBrandText}>{empresa?.empresa ? empresa.empresa.split(' ')[0].toUpperCase() : 'DALSIN'}</Text>
                <Text style={styles.logoSubtext}>Materiais de construção</Text>
              </>
            )}
          </View>

          {/* Centered Business Information */}
          <View style={styles.companyDetailsCentered}>
            <Text style={styles.companyName}>{empresa?.empresa || 'Dalsin Materiais de Construção'}</Text>
            <Text style={styles.companySub}>{empresa?.endereco || 'R. Alberto Muller, 68 - Santa Terezinha'}</Text>
            <Text style={styles.companySub}>
              Fone : {empresa?.telefone || '(48) 3259-9607'}      /
            </Text>
            <Text style={styles.companySub}>
              Whatsapp : {empresa?.telefone || '(48) 9665-2001'}      /      {empresa?.email || 'dalsin_materials@gmail.com'}
            </Text>
            <Text style={styles.companySub}>CNPJ: {empresa?.cnpjCpf || '00.423.523/0001-40'}</Text>
          </View>
        </View>

        {/* Big Underlined Centered Title */}
        <View style={styles.documentTitleContainer}>
          <Text style={styles.documentTitleText}>Orçamento</Text>
        </View>

        {/* Client details Grid layout mimicking the reference exactly */}
        <View style={styles.clientSection}>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Cliente : </Text>
            <Text style={styles.clientValue}>{orcamento.cliente.nome}</Text>
          </View>
          
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Endereço : </Text>
            <Text style={styles.clientValue}>
              {decomposto.logradouro} {decomposto.numero !== '—' ? decomposto.numero : ''}
            </Text>
          </View>

          <View style={styles.clientGridRow}>
            <View style={styles.colCEP}>
              <Text style={styles.gridLabel}>CEP : </Text>
              <Text style={styles.gridValue}>{decomposto.cep}</Text>
            </View>
            <View style={styles.colCidade}>
              <Text style={styles.gridLabel}>Cidade : </Text>
              <Text style={styles.gridValue}>{decomposto.cidade}</Text>
            </View>
            <View style={styles.colBairro}>
              <Text style={styles.gridLabel}>Bairro : </Text>
              <Text style={styles.gridValue}>{decomposto.bairro}</Text>
            </View>
          </View>

          <View style={styles.clientGridRow}>
            <View style={styles.colEmail}>
              <Text style={styles.gridLabel}>E-mail : </Text>
              <Text style={styles.gridValue}>{orcamento.cliente.email || '—'}</Text>
            </View>
            <View style={styles.colTelefone}>
              <Text style={styles.gridLabel}>Telefone : </Text>
              <Text style={styles.gridValue}>{orcamento.cliente.telefone || '—'}</Text>
            </View>
            <View style={styles.colEstado}>
              <Text style={styles.gridLabel}>Estado : </Text>
              <Text style={styles.gridValue}>{decomposto.estado}</Text>
            </View>
          </View>

          <View style={styles.clientGridRow}>
            <View style={styles.colCPF}>
              <Text style={styles.gridLabel}>CPF / CNPJ : </Text>
              <Text style={styles.gridValue}>{orcamento.cliente.cpfCnpj || '—'}</Text>
            </View>
            <View style={styles.colRG}>
              <Text style={styles.gridLabel}>RG / Insc. Estadual : </Text>
              <Text style={styles.gridValue}>Isento</Text>
            </View>
            <View style={styles.colCelular}>
              <Text style={styles.gridLabel}>Celular : </Text>
              <Text style={styles.gridValue}>{orcamento.cliente.telefone || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Divider item group */}
        <View style={styles.itensDivider}>
          <Text style={styles.itensDividerText}>ITENS</Text>
        </View>

        {/* Table list */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRowHeader}>
            <Text style={[styles.colDesc, styles.headerText]}>Quantidade X Descrição</Text>
            <Text style={[styles.colValUnit, styles.headerText]}>Valor Unitário</Text>
            <Text style={[styles.colValTotal, styles.headerText]}>Valor Total</Text>
          </View>

          {/* Rows */}
          {orcamento.itens && orcamento.itens.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={[styles.colDesc, styles.rowItemText]}>
                {item.quantidade} X {item.descricao.toUpperCase()}
              </Text>
              <Text style={[styles.colValUnit, styles.rowItemText]}>
                {formatCurrency(item.precoUnitario)}
              </Text>
              <Text style={[styles.colValTotal, styles.rowItemText]}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary Block */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBlock}>
            {/* Subtotal */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(orcamento.subtotal)}</Text>
            </View>
            
            {/* Discount */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Desconto</Text>
              <Text style={styles.totalValue}>{formatCurrency(getValorDesconto())}</Text>
            </View>

            {/* Optional Taxes Row */}
            {orcamento.impostos > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Impostos</Text>
                <Text style={styles.totalValue}>{formatCurrency(orcamento.impostos)}</Text>
              </View>
            )}

            {/* Total Final */}
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabel}>Total Final</Text>
              <Text style={styles.totalValue}>{formatCurrency(orcamento.total)}</Text>
            </View>
          </View>
        </View>

        {/* Observations Empty box placeholder styled exactly like the reference template */}
        <View style={styles.observacoesBox}>
          <Text style={styles.observacoesHeader}>Observações:</Text>
          <Text style={styles.observacoesText}>
            {orcamento.observacoes || ''}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

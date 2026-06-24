'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Rect, Image } from '@react-pdf/renderer';
import type { Orcamento, Usuario } from '@/types';

// Define beautiful modern layout styles matching the client-side UI
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
    paddingTop: 35,
    paddingHorizontal: 40,
    paddingBottom: 45,
    color: '#18181b', // zinc-900 equivalent
    backgroundColor: '#ffffff',
  },
  // Header with Logo and Company Info
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7', // zinc-200
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '35%',
  },
  logoImage: {
    width: 85,
    height: 45,
    objectFit: 'contain',
  },
  logoFallbackText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb', // primary blue
    textTransform: 'uppercase',
  },
  logoSubtext: {
    fontSize: 7,
    color: '#71717a',
    marginTop: 2,
  },
  companyDetails: {
    width: '60%',
    textAlign: 'right',
    fontSize: 8,
    color: '#71717a', // zinc-500
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
    marginBottom: 4,
  },
  companySub: {
    fontSize: 8,
    color: '#52525b',
    marginBottom: 2,
  },
  // Budget Title & Status
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  // Info Grid Box (Customer & Dates info)
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fafafa', // zinc-50 equivalent
    borderWidth: 1,
    borderColor: '#f4f4f5', // zinc-100 equivalent
    borderRadius: 6,
    padding: 10,
  },
  cardTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb', // primary blue
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#71717a', // zinc-500
    width: 60,
  },
  cardValue: {
    fontSize: 8,
    color: '#18181b',
    flex: 1,
  },
  // Address row
  addressSection: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f4f4f5',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  // Items Table section
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  table: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#71717a',
  },
  tdText: {
    fontSize: 8,
    color: '#18181b',
  },
  // Table Columns matching VisualizarOrcamentoDialog
  colItem: { width: '45%' },
  colTipo: { width: '15%', textAlign: 'center' },
  colQtd: { width: '10%', textAlign: 'right' },
  colUnit: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },

  // Tipo Badges
  typeBadgeProd: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    textAlign: 'center',
    alignSelf: 'center',
  },
  typeBadgeServ: {
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    textAlign: 'center',
    alignSelf: 'center',
  },

  // Totals Section
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalsContainer: {
    width: 200,
    gap: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    color: '#71717a',
  },
  totalGeralRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 6,
    marginTop: 4,
  },
  totalGeralValue: {
    color: '#2563eb', // blue-600
  },

  // Notes Box
  notesBox: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f4f4f5',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  notesHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: '#52525b',
    lineHeight: 1.4,
  },
});

interface OrcamentoPDFProps {
  orcamento: Orcamento;
  empresa: Usuario | null;
}

export function OrcamentoPDF({ orcamento, empresa }: OrcamentoPDFProps) {
  // Format dates securely
  const getFormattedDate = (criadoEm: any) => {
    if (!criadoEm) return '-';
    try {
      if (criadoEm.seconds) {
        return new Date(criadoEm.seconds * 1000).toLocaleDateString('pt-BR');
      }
      if (typeof criadoEm.toDate === 'function') {
        return criadoEm.toDate().toLocaleDateString('pt-BR');
      }
      return new Date(criadoEm).toLocaleDateString('pt-BR');
    } catch (e) {
      return '-';
    }
  };

  const formattedDate = getFormattedDate(orcamento.criadoEm);

  // Format currency helpers for Portuguese
  const formatCurrency = (val: number) => {
    return 'R$ ' + Number(val).toFixed(2).replace('.', ',');
  };

  // Calculate clean numeric value for discount
  const getValorDesconto = () => {
    if (!orcamento.desconto || orcamento.desconto <= 0) return 0;
    if (orcamento.descontoTipo === 'percentual') {
      return (orcamento.subtotal * orcamento.desconto) / 100;
    }
    return orcamento.desconto;
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      rascunho: 'Rascunho',
      enviado: 'Enviado',
      aprovado: 'Aprovado',
      recusado: 'Recusado',
      rejeitado: 'Rejeitado',
      cancelado: 'Cancelado',
      expirado: 'Expirado',
    };
    return labels[status] || status;
  };

  // Get status colors
  const getStatusStyle = (status: string) => {
    const bgColors: Record<string, string> = {
      rascunho: '#f4f4f5',
      enviado: '#eff6ff',
      aprovado: '#ecfdf5',
      recusado: '#fff1f2',
      rejeitado: '#fff1f2',
      cancelado: '#fef3c7',
      expirado: '#fff7ed',
    };
    const textColors: Record<string, string> = {
      rascunho: '#27272a',
      enviado: '#1d4ed8',
      aprovado: '#047857',
      recusado: '#be123c',
      rejeitado: '#be123c',
      cancelado: '#b45309',
      expirado: '#c2410c',
    };
    return {
      backgroundColor: bgColors[status] || '#f4f4f5',
      color: textColors[status] || '#27272a',
    };
  };

  const statusStyle = getStatusStyle(orcamento.status);

  // Secure local/proxied logo resolution
  const getProxyUrl = (url: string) => {
    if (url.startsWith('data:')) return url;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Master Header */}
        <View style={styles.headerSection}>
          {/* Logo Block */}
          <View style={styles.logoContainer}>
            {empresa?.logoUrl ? (
              <Image 
                src={getProxyUrl(empresa.logoUrl)} 
                style={styles.logoImage} 
              />
            ) : (
              <>
                <Svg width={30} height={24} viewBox="0 0 100 80">
                  <Path 
                    d="M 50 10 C 25 10 25 40 25 45 C 25 55 50 75 50 75 C 50 75 75 55 75 45 C 75 40 75 10 50 10 Z" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="5" 
                  />
                  <Path 
                    d="M 35 45 Q 50 35 65 45 C 65 45 65 52 65 52 L 35 52 Z" 
                    fill="#2563eb" 
                  />
                  <Rect x={47} y={26} width={6} height={12} fill="#2563eb" />
                </Svg>
                <Text style={styles.logoFallbackText}>
                  {empresa?.empresa ? empresa.empresa.split(' ')[0] : 'EMPRESA'}
                </Text>
                <Text style={styles.logoSubtext}>Propostas Comerciais</Text>
              </>
            )}
          </View>

          {/* Business Information */}
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{empresa?.empresa || 'Sua Empresa'}</Text>
            {empresa?.endereco && <Text style={styles.companySub}>{empresa.endereco}</Text>}
            {empresa?.telefone && <Text style={styles.companySub}>Fone / WhatsApp: {empresa.telefone}</Text>}
            {empresa?.email && <Text style={styles.companySub}>E-mail: {empresa.email}</Text>}
            {empresa?.cnpjCpf && <Text style={styles.companySub}>CNPJ: {empresa.cnpjCpf}</Text>}
          </View>
        </View>

        {/* Title and Status section */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Orçamento {orcamento.numero ? `#${orcamento.numero}` : ''}</Text>
          <View style={[styles.statusBadge, statusStyle]}>
            <Text>{getStatusLabel(orcamento.status)}</Text>
          </View>
        </View>

        {/* Customer and Validity Grid */}
        <View style={styles.infoGrid}>
          {/* Dados do Cliente */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Dados do Cliente</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Nome:</Text>
              <Text style={styles.cardValue}>{orcamento.cliente.nome}</Text>
            </View>
            {orcamento.cliente.cpfCnpj && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>CPF/CNPJ:</Text>
                <Text style={styles.cardValue}>{orcamento.cliente.cpfCnpj}</Text>
              </View>
            )}
            {orcamento.cliente.email && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>E-mail:</Text>
                <Text style={styles.cardValue}>{orcamento.cliente.email}</Text>
              </View>
            )}
            {orcamento.cliente.telefone && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Telefone:</Text>
                <Text style={styles.cardValue}>{orcamento.cliente.telefone}</Text>
              </View>
            )}
          </View>

          {/* Prazos e Validade */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Prazos e Validade</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Emissão:</Text>
              <Text style={styles.cardValue}>{formattedDate}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Validade:</Text>
              <Text style={styles.cardValue}>{orcamento.validadeDias || 15} dias</Text>
            </View>
            {orcamento.condicoesPagamento && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Pagamento:</Text>
                <Text style={styles.cardValue}>{orcamento.condicoesPagamento}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Address Row (if available) */}
        {orcamento.cliente.endereco && (
          <View style={styles.addressSection}>
            <Text style={styles.cardTitle}>Endereço de Entrega / Cobrança</Text>
            <Text style={styles.cardValue}>{orcamento.cliente.endereco}</Text>
          </View>
        )}

        {/* Items Section */}
        <Text style={styles.sectionTitle}>Itens do Orçamento</Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <View style={styles.colItem}>
              <Text style={styles.thText}>Item</Text>
            </View>
            <View style={styles.colTipo}>
              <Text style={[styles.thText, { textAlign: 'center' }]}>Tipo</Text>
            </View>
            <View style={styles.colQtd}>
              <Text style={[styles.thText, { textAlign: 'right' }]}>Qtd</Text>
            </View>
            <View style={styles.colUnit}>
              <Text style={[styles.thText, { textAlign: 'right' }]}>Unitário</Text>
            </View>
            <View style={styles.colTotal}>
              <Text style={[styles.thText, { textAlign: 'right' }]}>Total</Text>
            </View>
          </View>

          {/* Item Rows */}
          {orcamento.itens && orcamento.itens.length > 0 ? (
            orcamento.itens.map((item, index) => (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={styles.colItem}>
                  <Text style={styles.tdText}>{item.descricao}</Text>
                </View>
                <View style={styles.colTipo}>
                  <Text style={item.tipo === 'produto' ? styles.typeBadgeProd : styles.typeBadgeServ}>
                    {item.tipo === 'produto' ? 'PROD' : 'SERV'}
                  </Text>
                </View>
                <View style={styles.colQtd}>
                  <Text style={[styles.tdText, { textAlign: 'right' }]}>{item.quantidade}</Text>
                </View>
                <View style={styles.colUnit}>
                  <Text style={[styles.tdText, { textAlign: 'right' }]}>{formatCurrency(item.precoUnitario)}</Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={[styles.tdText, { textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tdText, { flex: 1, textAlign: 'center', color: '#71717a' }]}>
                Nenhum item adicionado.
              </Text>
            </View>
          )}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalsRow}>
              <Text>Subtotal:</Text>
              <Text>{formatCurrency(orcamento.subtotal)}</Text>
            </View>
            
            {getValorDesconto() > 0 && (
              <View style={[styles.totalsRow, { color: '#be123c' }]}>
                <Text>Desconto:</Text>
                <Text>- {formatCurrency(getValorDesconto())}</Text>
              </View>
            )}

            {orcamento.impostos > 0 && (
              <View style={[styles.totalsRow, { color: '#c2410c' }]}>
                <Text>Impostos/Acréscimos:</Text>
                <Text>+ {formatCurrency(orcamento.impostos)}</Text>
              </View>
            )}

            <View style={styles.totalGeralRow}>
              <Text>Total Geral:</Text>
              <Text style={styles.totalGeralValue}>{formatCurrency(orcamento.total)}</Text>
            </View>
          </View>
        </View>

        {/* Observations block */}
        {orcamento.observacoes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesHeader}>Observações</Text>
            <Text style={styles.notesText}>{orcamento.observacoes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

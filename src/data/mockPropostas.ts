// src/data/mockPropostas.ts
import { Proposta } from '../types/proposta';

export const mockPropostas: Proposta[] = [
  {
    id: 'prop-001',
    licitacaoId: 'lic-002', // CC 012/2026 — Governo do Estado de SP
    itens: [
      { id: 'it-1', descricao: 'Câmeras de segurança (unidade)', quantidade: 40, valorUnitario: 850 },
      { id: 'it-2', descricao: 'Central de monitoramento', quantidade: 1, valorUnitario: 32000 },
      { id: 'it-3', descricao: 'Instalação e configuração', quantidade: 1, valorUnitario: 18000 },
    ],
    condicoesPagamento: '30/60/90 dias após entrega e aceite técnico',
    validadeDias: 60,
    prazoEntregaDias: 45,
    status: 'enviada',
    dataEnvio: '2026-07-19T10:00:00.000Z',
    observacoes: 'Revisão 2 — valor ajustado após negociação de frete com o fornecedor.',
    criadoEm: '2026-07-15T09:00:00.000Z',
    atualizadoEm: '2026-07-19T10:00:00.000Z',
  },
  {
    id: 'prop-002',
    licitacaoId: 'lic-003', // PE 009/2026 — Barueri, merenda escolar
    itens: [
      { id: 'it-1', descricao: 'Cesta básica escolar (kit mensal)', quantidade: 1200, valorUnitario: 210 },
    ],
    condicoesPagamento: 'À vista, 15 dias após entrega',
    validadeDias: 45,
    status: 'recusada',
    dataEnvio: '2026-06-21T09:00:00.000Z',
    observacoes: 'Perdemos por valor — concorrente ofertou abaixo do nosso custo mínimo.',
    criadoEm: '2026-06-18T14:00:00.000Z',
    atualizadoEm: '2026-07-05T11:00:00.000Z',
  },
  {
    id: 'prop-003',
    licitacaoId: 'lic-001', // PE 045/2026 — Osasco, limpeza predial
    itens: [
      { id: 'it-1', descricao: 'Posto de limpeza (mensal, por posto)', quantidade: 6, valorUnitario: 6200 },
      { id: 'it-2', descricao: 'Material de limpeza e EPI (mensal)', quantidade: 6, valorUnitario: 1800 },
    ],
    condicoesPagamento: 'Mensal, faturado até o dia 5 do mês subsequente',
    validadeDias: 60,
    status: 'rascunho',
    observacoes: 'Ainda aguardando confirmação do cliente sobre quantidade de postos.',
    criadoEm: '2026-07-23T15:00:00.000Z',
    atualizadoEm: '2026-07-23T15:00:00.000Z',
  },
];

// src/data/mockLicitacoes.ts
//
// "Banco de dados" mockado das licitações, no mesmo espírito de
// `mockUsers.ts` / `mockClientes.ts`. Consumido só por `licitacaoService.ts`.

import { Licitacao } from '../types/licitacao';

const agora = new Date().toISOString();

export const mockLicitacoes: Licitacao[] = [
  {
    id: 'lic-001',
    numeroEdital: 'PE 045/2026',
    orgao: 'Prefeitura Municipal de Osasco',
    modalidade: 'pregao_eletronico',
    objeto: 'Contratação de serviços de limpeza e conservação predial',
    portalOrigem: 'ComprasNet',
    linkEdital: 'https://www.gov.br/compras/pt-br/exemplo-pe-045-2026',
    valorEstimado: 480000,
    dataPublicacao: '2026-07-20T00:00:00.000Z',
    dataAberturaSessao: '2026-08-10T14:00:00.000Z',
    clienteId: 'cli-004',
    status: 'em_analise',
    analistaResponsavel: 'Ana',
    checklist: [
      { id: 'chk-1', etapa: 'Edital baixado', concluido: true, concluidoEm: '2026-07-21T10:00:00.000Z' },
      { id: 'chk-2', etapa: 'Resumo do edital feito', concluido: true, concluidoEm: '2026-07-22T09:30:00.000Z' },
      { id: 'chk-3', etapa: 'Proposta elaborada', concluido: false },
      { id: 'chk-4', etapa: 'Proposta enviada ao cliente', concluido: false },
      { id: 'chk-5', etapa: 'Documentos de habilitação anexados', concluido: false },
      { id: 'chk-6', etapa: 'Disputa registrada no SIGA Pregão', concluido: false },
    ],
    observacoes: 'Cliente pediu para priorizar, é a segunda vez que participa desse órgão.',
    historico: [
      { id: 'h-1', data: '2026-07-20T11:00:00.000Z', usuario: 'Márcio', acao: 'Licitação cadastrada no sistema' },
      { id: 'h-2', data: '2026-07-22T09:30:00.000Z', usuario: 'Ana (analista)', acao: 'Resumo do edital concluído' },
    ],
    criadoEm: '2026-07-20T11:00:00.000Z',
    atualizadoEm: '2026-07-22T09:30:00.000Z',
  },
  {
    id: 'lic-002',
    numeroEdital: 'CC 012/2026',
    orgao: 'Governo do Estado de São Paulo',
    modalidade: 'concorrencia',
    objeto: 'Fornecimento de equipamentos de segurança patrimonial',
    portalOrigem: 'BEC/SP',
    valorEstimado: 1250000,
    dataPublicacao: '2026-07-10T00:00:00.000Z',
    dataAberturaSessao: '2026-08-04T09:00:00.000Z',
    clienteId: 'cli-005',
    status: 'enviado',
    analistaResponsavel: 'Bruno',
    checklist: [
      { id: 'chk-1', etapa: 'Edital baixado', concluido: true, concluidoEm: '2026-07-11T08:00:00.000Z' },
      { id: 'chk-2', etapa: 'Resumo do edital feito', concluido: true, concluidoEm: '2026-07-11T15:00:00.000Z' },
      { id: 'chk-3', etapa: 'Proposta elaborada', concluido: true, concluidoEm: '2026-07-18T17:00:00.000Z' },
      { id: 'chk-4', etapa: 'Proposta enviada ao cliente', concluido: true, concluidoEm: '2026-07-19T10:00:00.000Z' },
      { id: 'chk-5', etapa: 'Documentos de habilitação anexados', concluido: true, concluidoEm: '2026-07-25T13:00:00.000Z' },
      { id: 'chk-6', etapa: 'Disputa registrada no SIGA Pregão', concluido: false },
    ],
    observacoes: '',
    historico: [
      { id: 'h-1', data: '2026-07-10T12:00:00.000Z', usuario: 'Márcio', acao: 'Licitação cadastrada no sistema' },
      { id: 'h-2', data: '2026-07-19T10:00:00.000Z', usuario: 'Bruno (analista)', acao: 'Proposta enviada ao cliente' },
    ],
    criadoEm: '2026-07-10T12:00:00.000Z',
    atualizadoEm: '2026-07-25T13:00:00.000Z',
  },
  {
    id: 'lic-003',
    numeroEdital: 'PE 009/2026',
    orgao: 'Prefeitura Municipal de Barueri',
    modalidade: 'pregao_eletronico',
    objeto: 'Aquisição de gêneros alimentícios para merenda escolar',
    portalOrigem: 'Licitações-e',
    valorEstimado: 320000,
    dataPublicacao: '2026-06-15T00:00:00.000Z',
    dataAberturaSessao: '2026-07-05T10:00:00.000Z',
    clienteId: 'cli-003',
    status: 'perdido',
    analistaResponsavel: 'Ana',
    checklist: [
      { id: 'chk-1', etapa: 'Edital baixado', concluido: true, concluidoEm: '2026-06-16T08:00:00.000Z' },
      { id: 'chk-2', etapa: 'Resumo do edital feito', concluido: true, concluidoEm: '2026-06-16T14:00:00.000Z' },
      { id: 'chk-3', etapa: 'Proposta elaborada', concluido: true, concluidoEm: '2026-06-20T16:00:00.000Z' },
      { id: 'chk-4', etapa: 'Proposta enviada ao cliente', concluido: true, concluidoEm: '2026-06-21T09:00:00.000Z' },
      { id: 'chk-5', etapa: 'Documentos de habilitação anexados', concluido: true, concluidoEm: '2026-06-28T11:00:00.000Z' },
      { id: 'chk-6', etapa: 'Disputa registrada no SIGA Pregão', concluido: true, concluidoEm: '2026-07-05T10:30:00.000Z' },
    ],
    observacoes: 'Concorrente ofertou valor abaixo do estimado. Avaliar margem para próximas disputas desse órgão.',
    historico: [
      { id: 'h-1', data: '2026-06-15T09:00:00.000Z', usuario: 'Márcio', acao: 'Licitação cadastrada no sistema' },
      { id: 'h-2', data: '2026-07-05T11:00:00.000Z', usuario: 'Ana (analista)', acao: 'Resultado da disputa: perdido' },
    ],
    criadoEm: '2026-06-15T09:00:00.000Z',
    atualizadoEm: '2026-07-05T11:00:00.000Z',
  },
  {
    id: 'lic-004',
    numeroEdital: 'TP 003/2026',
    orgao: 'Câmara Municipal de Cotia',
    modalidade: 'tomada_de_precos',
    objeto: 'Reforma e manutenção predial',
    portalOrigem: 'Portal de Compras do Município',
    valorEstimado: 210000,
    dataPublicacao: '2026-07-27T00:00:00.000Z',
    dataAberturaSessao: '2026-08-06T13:30:00.000Z',
    clienteId: 'cli-001',
    status: 'pendente',
    analistaResponsavel: 'Bruno',
    checklist: [
      { id: 'chk-1', etapa: 'Edital baixado', concluido: true, concluidoEm: '2026-07-28T08:00:00.000Z' },
      { id: 'chk-2', etapa: 'Resumo do edital feito', concluido: false },
      { id: 'chk-3', etapa: 'Proposta elaborada', concluido: false },
      { id: 'chk-4', etapa: 'Proposta enviada ao cliente', concluido: false },
      { id: 'chk-5', etapa: 'Documentos de habilitação anexados', concluido: false },
      { id: 'chk-6', etapa: 'Disputa registrada no SIGA Pregão', concluido: false },
    ],
    observacoes: '',
    historico: [
      { id: 'h-1', data: '2026-07-28T08:00:00.000Z', usuario: 'Márcio', acao: 'Licitação cadastrada no sistema' },
    ],
    criadoEm: '2026-07-28T08:00:00.000Z',
    atualizadoEm: '2026-07-28T08:00:00.000Z',
  },
];

export { agora as dataReferenciaMock };

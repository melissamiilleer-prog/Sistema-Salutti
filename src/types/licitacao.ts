// src/types/licitacao.ts
//
// Contrato de dados do módulo de Licitações. Qualquer tela ou service que
// consuma licitações deve depender apenas destes tipos — assim, trocar o
// mock por uma API real (Supabase/PostgreSQL) não exige mudar nada além
// de `licitacaoService.ts`.

export type StatusLicitacao =
  | 'pendente'
  | 'em_analise'
  | 'enviado'
  | 'ganho'
  | 'perdido';

export const STATUS_LICITACAO_LABEL: Record<StatusLicitacao, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  enviado: 'Enviado',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

export type ModalidadeLicitacao =
  | 'pregao_eletronico'
  | 'concorrencia'
  | 'tomada_de_precos'
  | 'convite'
  | 'dispensa'
  | 'inexigibilidade';

export const MODALIDADE_LICITACAO_LABEL: Record<ModalidadeLicitacao, string> = {
  pregao_eletronico: 'Pregão Eletrônico',
  concorrencia: 'Concorrência',
  tomada_de_precos: 'Tomada de Preços',
  convite: 'Convite',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
};

export interface ChecklistItem {
  id: string;
  etapa: string;
  concluido: boolean;
  concluidoEm?: string; // ISO date, preenchido quando concluido vira true
}

export interface HistoricoAcao {
  id: string;
  data: string; // ISO date
  usuario: string;
  acao: string;
}

export interface Licitacao {
  id: string;

  // Aba 1 — Dados do Edital
  numeroEdital: string;
  orgao: string;
  modalidade: ModalidadeLicitacao;
  objeto: string;
  portalOrigem: string; // ex: "ComprasNet", "BEC", "Licitações-e"
  linkEdital?: string;
  valorEstimado: number;

  // Aba 2 — Datas e Prazos
  dataPublicacao: string; // ISO date
  dataAberturaSessao: string; // ISO datetime da sessão/disputa

  // Aba 3 — Cliente Vinculado
  clienteId: string;
  status: StatusLicitacao;
  analistaResponsavel?: string; // nome do analista da "carteira própria" (Cap. 4 do PRD)

  // Aba 4 — Checklist
  checklist: ChecklistItem[];

  // Aba 5 — Observações / Histórico
  observacoes: string;
  historico: HistoricoAcao[];

  criadoEm: string;
  atualizadoEm: string;
}

// Payload usado pelo formulário de criação/edição (sem campos derivados/controlados pelo sistema)
export type LicitacaoFormData = Omit<
  Licitacao,
  'id' | 'historico' | 'criadoEm' | 'atualizadoEm'
>;

export const CHECKLIST_PADRAO: Omit<ChecklistItem, 'id'>[] = [
  { etapa: 'Edital baixado', concluido: false },
  { etapa: 'Resumo do edital feito', concluido: false },
  { etapa: 'Proposta elaborada', concluido: false },
  { etapa: 'Proposta enviada ao cliente', concluido: false },
  { etapa: 'Documentos de habilitação anexados', concluido: false },
  { etapa: 'Disputa registrada no SIGA Pregão', concluido: false },
];

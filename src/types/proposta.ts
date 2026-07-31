// src/types/proposta.ts
//
// Contrato de dados de Orçamentos/Propostas (Cap. 5 e 7 do PRD):
// relação 1:N com Licitação — uma licitação pode ter várias propostas
// (ex: revisões de valor antes do envio final).

export type StatusProposta = 'rascunho' | 'enviada' | 'aceita' | 'recusada';

export const STATUS_PROPOSTA_LABEL: Record<StatusProposta, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aceita: 'Aceita',
  recusada: 'Recusada',
};

export interface ItemOrcamento {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Proposta {
  id: string;
  licitacaoId: string;

  itens: ItemOrcamento[];
  condicoesPagamento: string;
  validadeDias: number; // validade da proposta em dias, a partir do envio
  prazoEntregaDias?: number;

  status: StatusProposta;
  dataEnvio?: string; // ISO date, preenchido quando status vira "enviada"
  observacoes: string;

  criadoEm: string;
  atualizadoEm: string;
}

export type PropostaFormData = Omit<Proposta, 'id' | 'criadoEm' | 'atualizadoEm'>;

export function calcularTotalProposta(itens: ItemOrcamento[]): number {
  return itens.reduce((total, item) => total + item.quantidade * item.valorUnitario, 0);
}

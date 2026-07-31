// src/types/disputa.ts
//
// Registro do resultado da sessão de disputa (Cap. 5 do PRD: "Disputas —
// SIGA Pregão"). Relação 1:1 com Licitação — cada licitação tem, no
// máximo, uma disputa registrada (a sessão em si acontece fora do sistema,
// no app do SIGA Pregão; aqui só guardamos o resultado).

export type ResultadoDisputa = 'em_andamento' | 'ganho' | 'perdido';

export const RESULTADO_DISPUTA_LABEL: Record<ResultadoDisputa, string> = {
  em_andamento: 'Em andamento',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

export interface Disputa {
  id: string;
  licitacaoId: string;

  dataSessaoRealizada?: string; // ISO datetime — quando a sessão de fato ocorreu
  valorNossaOfertaFinal?: number; // último lance dado por nós
  valorVencedor?: number; // valor da oferta vencedora (nossa ou do concorrente)
  nomeVencedor?: string; // "Salutti" se ganhamos, ou nome do concorrente
  posicaoFinal?: number; // 1º, 2º, 3º lugar etc.

  resultado: ResultadoDisputa;
  observacoes: string;
  linkAtaSigaPregao?: string; // link/registro da ata no app do SIGA Pregão

  criadoEm: string;
  atualizadoEm: string;
}

export type DisputaFormData = Omit<Disputa, 'id' | 'criadoEm' | 'atualizadoEm'>;

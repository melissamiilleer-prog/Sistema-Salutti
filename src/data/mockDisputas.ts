// src/data/mockDisputas.ts
import { Disputa } from '../types/disputa';

export const mockDisputas: Disputa[] = [
  {
    id: 'disp-001',
    licitacaoId: 'lic-003', // PE 009/2026 — Barueri, merenda escolar (perdida)
    dataSessaoRealizada: '2026-07-05T10:00:00.000Z',
    valorNossaOfertaFinal: 254000,
    valorVencedor: 248500,
    nomeVencedor: 'Distribuidora Alimentar Sul Ltda',
    posicaoFinal: 2,
    resultado: 'perdido',
    observacoes: 'Concorrente cobriu nosso último lance por uma margem pequena. Reavaliar precificação de itens perecíveis para próximas disputas desse órgão.',
    linkAtaSigaPregao: 'https://app.sigapregao.com.br/ata/exemplo-pe-009-2026',
    criadoEm: '2026-07-05T10:30:00.000Z',
    atualizadoEm: '2026-07-05T11:00:00.000Z',
  },
  {
    id: 'disp-002',
    licitacaoId: 'lic-002', // CC 012/2026 — Governo do Estado de SP (proposta enviada, disputa ainda não ocorreu)
    resultado: 'em_andamento',
    observacoes: 'Sessão ainda não ocorreu — aguardando data definitiva no portal BEC/SP.',
    criadoEm: '2026-07-19T11:00:00.000Z',
    atualizadoEm: '2026-07-19T11:00:00.000Z',
  },
];

// src/services/disputaService.ts
//
// Mesmo padrão de `licitacaoService.ts` / `propostaService.ts`.
//
// PONTO IMPORTANTE: quando o resultado da disputa é definido como "ganho"
// ou "perdido", este service atualiza automaticamente o `status` da
// Licitação correspondente (via `licitacaoService.atualizarStatus`), para
// que a Mesa de Trabalho e a listagem de Licitações reflitam o resultado
// sem precisar de uma segunda edição manual.

import { Disputa, DisputaFormData, ResultadoDisputa } from '../types/disputa';
import { mockDisputas } from '../data/mockDisputas';
import { licitacaoService } from './licitacaoService';

const STORAGE_KEY = 'salutti:disputas';

function lerStorage(): Disputa[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDisputas));
    return mockDisputas;
  }
  try {
    return JSON.parse(raw) as Disputa[];
  } catch {
    return mockDisputas;
  }
}

function salvarStorage(disputas: Disputa[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(disputas));
}

function gerarId(): string {
  return `disp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function simularLatencia<T>(valor: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

async function sincronizarStatusLicitacao(licitacaoId: string, resultado: ResultadoDisputa, usuario: string) {
  if (resultado === 'ganho' || resultado === 'perdido') {
    await licitacaoService.atualizarStatus(licitacaoId, resultado, usuario);
  }
}

export const disputaService = {
  // SUPABASE: trocar por supabase.from('disputas').select('*').eq('licitacao_id', licitacaoId).maybeSingle()
  async buscarPorLicitacao(licitacaoId: string): Promise<Disputa | null> {
    const itens = lerStorage();
    return simularLatencia(itens.find((d) => d.licitacaoId === licitacaoId) ?? null);
  },

  // SUPABASE: trocar por supabase.from('disputas').select('*, licitacao:licitacoes(*)')
  async listarTodas(): Promise<Disputa[]> {
    const itens = lerStorage();
    return simularLatencia(
      [...itens].sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
    );
  },

  // SUPABASE: trocar por supabase.from('disputas').insert(payload).select().single()
  async criar(dados: DisputaFormData, usuario: string): Promise<Disputa> {
    const itens = lerStorage();
    const agora = new Date().toISOString();
    const nova: Disputa = { ...dados, id: gerarId(), criadoEm: agora, atualizadoEm: agora };
    salvarStorage([...itens, nova]);
    await sincronizarStatusLicitacao(nova.licitacaoId, nova.resultado, usuario);
    return simularLatencia(nova);
  },

  // SUPABASE: trocar por supabase.from('disputas').update(payload).eq('id', id).select().single()
  async atualizar(id: string, dados: Partial<DisputaFormData>, usuario: string): Promise<Disputa> {
    const itens = lerStorage();
    const index = itens.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Disputa não encontrada');

    const atualizada: Disputa = {
      ...itens[index],
      ...dados,
      atualizadoEm: new Date().toISOString(),
    };
    itens[index] = atualizada;
    salvarStorage(itens);

    if (dados.resultado) {
      await sincronizarStatusLicitacao(atualizada.licitacaoId, atualizada.resultado, usuario);
    }
    return simularLatencia(atualizada);
  },

  // SUPABASE: trocar por supabase.from('disputas').delete().eq('id', id)
  async excluir(id: string): Promise<void> {
    const itens = lerStorage().filter((d) => d.id !== id);
    salvarStorage(itens);
    return simularLatencia(undefined);
  },
};

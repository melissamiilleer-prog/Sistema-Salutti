// src/services/propostaService.ts
//
// Mesmo padrão de `licitacaoService.ts`: hoje lê/escreve em `localStorage`;
// no futuro, só este arquivo muda para integrar com Supabase (comentários
// "SUPABASE:" abaixo).

import { Proposta, PropostaFormData } from '../types/proposta';
import { mockPropostas } from '../data/mockPropostas';

const STORAGE_KEY = 'salutti:propostas';

function lerStorage(): Proposta[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPropostas));
    return mockPropostas;
  }
  try {
    return JSON.parse(raw) as Proposta[];
  } catch {
    return mockPropostas;
  }
}

function salvarStorage(propostas: Proposta[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(propostas));
}

function gerarId(): string {
  return `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function simularLatencia<T>(valor: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

export const propostaService = {
  // SUPABASE: trocar por supabase.from('propostas').select('*').eq('licitacao_id', licitacaoId)
  async listarPorLicitacao(licitacaoId: string): Promise<Proposta[]> {
    const itens = lerStorage().filter((p) => p.licitacaoId === licitacaoId);
    return simularLatencia(
      [...itens].sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
    );
  },

  // SUPABASE: trocar por supabase.from('propostas').select('*, licitacao:licitacoes(*)')
  async listarTodas(): Promise<Proposta[]> {
    const itens = lerStorage();
    return simularLatencia(
      [...itens].sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
    );
  },

  // SUPABASE: trocar por supabase.from('propostas').select('*').eq('id', id).single()
  async buscarPorId(id: string): Promise<Proposta | null> {
    const itens = lerStorage();
    return simularLatencia(itens.find((p) => p.id === id) ?? null);
  },

  // SUPABASE: trocar por supabase.from('propostas').insert(payload).select().single()
  async criar(dados: PropostaFormData): Promise<Proposta> {
    const itens = lerStorage();
    const agora = new Date().toISOString();
    const nova: Proposta = { ...dados, id: gerarId(), criadoEm: agora, atualizadoEm: agora };
    salvarStorage([...itens, nova]);
    return simularLatencia(nova);
  },

  // SUPABASE: trocar por supabase.from('propostas').update(payload).eq('id', id).select().single()
  async atualizar(id: string, dados: Partial<PropostaFormData>): Promise<Proposta> {
    const itens = lerStorage();
    const index = itens.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Proposta não encontrada');

    const atualizada: Proposta = {
      ...itens[index],
      ...dados,
      atualizadoEm: new Date().toISOString(),
    };
    itens[index] = atualizada;
    salvarStorage(itens);
    return simularLatencia(atualizada);
  },

  // SUPABASE: trocar por supabase.from('propostas').delete().eq('id', id)
  async excluir(id: string): Promise<void> {
    const itens = lerStorage().filter((p) => p.id !== id);
    salvarStorage(itens);
    return simularLatencia(undefined);
  },
};

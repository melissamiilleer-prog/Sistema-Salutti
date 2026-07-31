// src/services/licitacaoService.ts
//
// Camada isolada de acesso a dados de Licitações — segue exatamente o
// mesmo espírito de `authService.ts` / `clienteService.ts` /
// `funcionarioService.ts`: hoje lê/escreve em `localStorage` a partir do
// mock em `data/mockLicitacoes.ts`; no futuro, ESTE é o único arquivo que
// precisa mudar para integrar com Supabase/PostgreSQL (ver comentários
// "SUPABASE:" abaixo em cada função).
//
// Nenhuma tela deve importar `mockLicitacoes.ts` diretamente — sempre
// passe por este service, para a troca futura ser transparente.

import { Licitacao, LicitacaoFormData, ChecklistItem, CHECKLIST_PADRAO } from '../types/licitacao';
import { mockLicitacoes } from '../data/mockLicitacoes';

const STORAGE_KEY = 'salutti:licitacoes';

function lerStorage(): Licitacao[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockLicitacoes));
    return mockLicitacoes;
  }
  try {
    return JSON.parse(raw) as Licitacao[];
  } catch {
    return mockLicitacoes;
  }
}

function salvarStorage(licitacoes: Licitacao[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(licitacoes));
}

function gerarId(): string {
  return `lic-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function simularLatencia<T>(valor: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

export interface FiltroLicitacoes {
  busca?: string; // número do edital, órgão ou objeto
  status?: string;
  analista?: string; // filtra pela "carteira própria" do analista (Cap. 4 do PRD)
  page?: number;
  pageSize?: number;
}

export interface ResultadoPaginado<T> {
  itens: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const licitacaoService = {
  // SUPABASE: trocar por
  //   supabase.from('licitacoes').select('*, cliente:clientes(*)')
  //   com .ilike / .eq para busca e filtro, e .range() para paginação.
  async listar(filtro: FiltroLicitacoes = {}): Promise<ResultadoPaginado<Licitacao>> {
    const { busca = '', status = '', analista = '', page = 1, pageSize = 10 } = filtro;
    let itens = lerStorage();

    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      itens = itens.filter(
        (l) =>
          l.numeroEdital.toLowerCase().includes(termo) ||
          l.orgao.toLowerCase().includes(termo) ||
          l.objeto.toLowerCase().includes(termo)
      );
    }

    if (status) {
      itens = itens.filter((l) => l.status === status);
    }

    if (analista) {
      itens = itens.filter((l) => l.analistaResponsavel === analista);
    }

    itens = [...itens].sort(
      (a, b) => new Date(a.dataAberturaSessao).getTime() - new Date(b.dataAberturaSessao).getTime()
    );

    const total = itens.length;
    const start = (page - 1) * pageSize;
    const pagina = itens.slice(start, start + pageSize);

    return simularLatencia({ itens: pagina, total, page, pageSize });
  },

  // Usado pela Mesa de Trabalho: todas as licitações ainda em andamento
  // (exclui 'ganho'/'perdido'), sem paginação, opcionalmente filtradas por
  // analista. Ordenadas pela sessão mais próxima primeiro.
  // SUPABASE: trocar por
  //   supabase.from('licitacoes').select('*').not('status', 'in', '(ganho,perdido)')
  async listarAtivas(analista?: string): Promise<Licitacao[]> {
    let itens = lerStorage().filter((l) => l.status !== 'ganho' && l.status !== 'perdido');
    if (analista) {
      itens = itens.filter((l) => l.analistaResponsavel === analista);
    }
    itens = [...itens].sort(
      (a, b) => new Date(a.dataAberturaSessao).getTime() - new Date(b.dataAberturaSessao).getTime()
    );
    return simularLatencia(itens);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').select('*').eq('id', id).single()
  async buscarPorId(id: string): Promise<Licitacao | null> {
    const itens = lerStorage();
    return simularLatencia(itens.find((l) => l.id === id) ?? null);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').insert(payload).select().single()
  async criar(dados: LicitacaoFormData, usuario: string): Promise<Licitacao> {
    const itens = lerStorage();
    const agora = new Date().toISOString();

    const checklist: ChecklistItem[] =
      dados.checklist?.length
        ? dados.checklist
        : CHECKLIST_PADRAO.map((c, i) => ({ ...c, id: `chk-${i + 1}` }));

    const nova: Licitacao = {
      ...dados,
      id: gerarId(),
      checklist,
      historico: [
        { id: `h-${Date.now()}`, data: agora, usuario, acao: 'Licitação cadastrada no sistema' },
      ],
      criadoEm: agora,
      atualizadoEm: agora,
    };

    const atualizado = [...itens, nova];
    salvarStorage(atualizado);
    return simularLatencia(nova);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').update(payload).eq('id', id).select().single()
  async atualizar(id: string, dados: Partial<LicitacaoFormData>, usuario: string): Promise<Licitacao> {
    const itens = lerStorage();
    const index = itens.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Licitação não encontrada');

    const agora = new Date().toISOString();
    const anterior = itens[index];
    const atualizada: Licitacao = {
      ...anterior,
      ...dados,
      historico: [
        ...anterior.historico,
        { id: `h-${Date.now()}`, data: agora, usuario, acao: 'Dados da licitação atualizados' },
      ],
      atualizadoEm: agora,
    };

    itens[index] = atualizada;
    salvarStorage(itens);
    return simularLatencia(atualizada);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').update({ status }).eq('id', id)
  async atualizarStatus(id: string, status: Licitacao['status'], usuario: string): Promise<Licitacao> {
    return this.atualizar(id, { status }, usuario);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').update({ checklist }).eq('id', id)
  async atualizarChecklistItem(id: string, checklistItemId: string, concluido: boolean, usuario: string): Promise<Licitacao> {
    const licitacao = await this.buscarPorId(id);
    if (!licitacao) throw new Error('Licitação não encontrada');

    const agora = new Date().toISOString();
    const checklist = licitacao.checklist.map((item) =>
      item.id === checklistItemId
        ? { ...item, concluido, concluidoEm: concluido ? agora : undefined }
        : item
    );

    return this.atualizar(id, { checklist }, usuario);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').delete().eq('id', id)
  async excluir(id: string): Promise<void> {
    const itens = lerStorage().filter((l) => l.id !== id);
    salvarStorage(itens);
    return simularLatencia(undefined);
  },
};

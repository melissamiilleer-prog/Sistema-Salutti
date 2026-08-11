// src/services/configuracaoService.ts
//
// Mesmo padrão dos demais services: hoje lê/escreve em `localStorage`; no
// futuro, só este arquivo muda para integrar com Supabase (uma única
// linha na tabela `configuracoes`, ou uma tabela `configuracoes_sistema`
// com uma linha fixa — ver comentário SUPABASE: abaixo).
//
// Outros services (`licitacaoService.ts`) e páginas (`MesaDeTrabalhoPage`)
// já consultam este service para etapas de checklist padrão e links
// rápidos, em vez de ter esses valores fixos espalhados pelo código.

import { ConfiguracoesSistema, DadosEmpresa, RegraPrazoInterno, LinkRapido } from '../types/configuracoes';
import { mockConfiguracoes } from '../data/mockConfiguracoes';

const STORAGE_KEY = 'salutti:configuracoes';

function lerStorage(): ConfiguracoesSistema {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockConfiguracoes));
    return mockConfiguracoes;
  }
  try {
    return JSON.parse(raw) as ConfiguracoesSistema;
  } catch {
    return mockConfiguracoes;
  }
}

function salvarStorage(config: ConfiguracoesSistema): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function simularLatencia<T>(valor: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

export const configuracaoService = {
  // Leitura síncrona da regra de prazo, usada por src/utils/prazoUtils.ts —
  // como o localStorage é síncrono, não precisamos tornar prazoUtils.ts
  // assíncrono só por causa disso. Quando migrar para Supabase, prazoUtils
  // precisará receber a regra como parâmetro (buscada de forma assíncrona
  // uma vez, no carregamento da página) em vez de ler daqui direto.
  obterRegraPrazoSync(): { diasUteisAntes: number; horario: string } {
    return lerStorage().regraPrazoInterno;
  },

  // SUPABASE: trocar por supabase.from('configuracoes_sistema').select('*').single()
  async obter(): Promise<ConfiguracoesSistema> {
    return simularLatencia(lerStorage());
  },

  // SUPABASE: trocar por supabase.from('configuracoes_sistema').update({ dados_empresa: dados }).eq('id', 1)
  async atualizarDadosEmpresa(dados: DadosEmpresa): Promise<ConfiguracoesSistema> {
    const atual = lerStorage();
    const atualizado: ConfiguracoesSistema = { ...atual, dadosEmpresa: dados, atualizadoEm: new Date().toISOString() };
    salvarStorage(atualizado);
    return simularLatencia(atualizado);
  },

  // SUPABASE: trocar por supabase.from('configuracoes_sistema').update({ regra_prazo_interno: regra }).eq('id', 1)
  async atualizarRegraPrazo(regra: RegraPrazoInterno): Promise<ConfiguracoesSistema> {
    const atual = lerStorage();
    const atualizado: ConfiguracoesSistema = { ...atual, regraPrazoInterno: regra, atualizadoEm: new Date().toISOString() };
    salvarStorage(atualizado);
    return simularLatencia(atualizado);
  },

  // SUPABASE: trocar por supabase.from('configuracoes_sistema').update({ links_rapidos: links }).eq('id', 1)
  async atualizarLinksRapidos(links: LinkRapido[]): Promise<ConfiguracoesSistema> {
    const atual = lerStorage();
    const atualizado: ConfiguracoesSistema = { ...atual, linksRapidos: links, atualizadoEm: new Date().toISOString() };
    salvarStorage(atualizado);
    return simularLatencia(atualizado);
  },

  // Atalho usado pela Mesa de Trabalho
  async obterLinksRapidos(): Promise<LinkRapido[]> {
    const config = lerStorage();
    return simularLatencia(config.linksRapidos, 50);
  },
};

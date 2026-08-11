// src/utils/licitacaoCalculos.ts
//
// Cálculos automáticos previstos na seção 5 da Especificação Funcional
// v2.1. Centralizados aqui para não duplicar a lógica entre o formulário
// (LicitacaoFormModal) e outras telas que precisem exibir os mesmos totais
// (ex.: RelatoriosPage, Portal do Cliente, quando forem revisados).

import { ItemLicitacao } from '@/types/licitacao';

/** Total de referência de um item: valor unitário de referência × quantidade. */
export function totalReferenciaItem(item: ItemLicitacao): number {
  return item.precoReferencia * item.quantidade;
}

/** Soma dos totais de referência de todos os itens que compõem um grupo. */
export function totalReferenciaGrupo(itens: ItemLicitacao[], grupoId: string): number {
  return itens
    .filter((item) => item.grupoId === grupoId)
    .reduce((soma, item) => soma + totalReferenciaItem(item), 0);
}

/**
 * Valor total de referência da oportunidade inteira: soma de todos os itens
 * selecionados, sejam eles de grupo ou individuais (spec 4.2, Aba 5,
 * "Importante: no final de tudo, deve aparecer o total da oportunidade").
 */
export function totalReferenciaOportunidade(itens: ItemLicitacao[]): number {
  return itens.reduce((soma, item) => soma + totalReferenciaItem(item), 0);
}

/** Total que o cliente informou para um item (preço mínimo × quantidade). */
export function totalClienteItem(item: ItemLicitacao): number | null {
  const precoMinimo = item.propostaCliente?.precoMinimo;
  if (precoMinimo == null) return null;
  return precoMinimo * item.quantidade;
}

/**
 * Competitividade do item: valor de referência dividido pela soma do valor
 * digitado pelo cliente com o valor do frete (spec seção 5). Retorna null
 * quando o cliente ainda não preencheu o preço mínimo.
 */
export function competitividadeItem(item: ItemLicitacao, valorFrete = 0): number | null {
  const precoMinimo = item.propostaCliente?.precoMinimo;
  if (precoMinimo == null) return null;
  const denominador = precoMinimo + valorFrete;
  if (denominador === 0) return null;
  return item.precoReferencia / denominador;
}

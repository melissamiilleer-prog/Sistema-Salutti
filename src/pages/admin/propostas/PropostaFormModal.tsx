// src/pages/admin/propostas/PropostaFormModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/Modal';
import { InputField, SelectField, TextAreaField } from '../../../components/FormFields';
import {
  Proposta,
  PropostaFormData,
  ItemOrcamento,
  StatusProposta,
  STATUS_PROPOSTA_LABEL,
  calcularTotalProposta,
} from '../../../types/proposta';
import { formatarMoeda } from '../../../utils/prazoUtils';

function novoItem(): ItemOrcamento {
  return { id: `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`, descricao: '', quantidade: 1, valorUnitario: 0 };
}

function criarFormularioVazio(licitacaoId: string): PropostaFormData {
  return {
    licitacaoId,
    itens: [novoItem()],
    condicoesPagamento: '',
    validadeDias: 30,
    prazoEntregaDias: undefined,
    status: 'rascunho',
    dataEnvio: undefined,
    observacoes: '',
  };
}

interface PropostaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: PropostaFormData) => Promise<void>;
  licitacaoId: string;
  numeroEditalReferencia: string;
  propostaEmEdicao?: Proposta | null;
}

export function PropostaFormModal({
  isOpen,
  onClose,
  onSave,
  licitacaoId,
  numeroEditalReferencia,
  propostaEmEdicao,
}: PropostaFormModalProps) {
  const [form, setForm] = useState<PropostaFormData>(criarFormularioVazio(licitacaoId));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(propostaEmEdicao ? { ...propostaEmEdicao } : criarFormularioVazio(licitacaoId));
  }, [isOpen, propostaEmEdicao, licitacaoId]);

  function atualizarCampo<K extends keyof PropostaFormData>(campo: K, valor: PropostaFormData[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarItem(id: string, campo: keyof ItemOrcamento, valor: string | number) {
    setForm((atual) => ({
      ...atual,
      itens: atual.itens.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)),
    }));
  }

  function adicionarItem() {
    setForm((atual) => ({ ...atual, itens: [...atual.itens, novoItem()] }));
  }

  function removerItem(id: string) {
    setForm((atual) => ({ ...atual, itens: atual.itens.filter((item) => item.id !== id) }));
  }

  function mudarStatus(novoStatus: StatusProposta) {
    setForm((atual) => ({
      ...atual,
      status: novoStatus,
      dataEnvio: novoStatus === 'enviada' && !atual.dataEnvio ? new Date().toISOString() : atual.dataEnvio,
    }));
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  const total = calcularTotalProposta(form.itens);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={propostaEmEdicao ? `Editar proposta — ${numeroEditalReferencia}` : `Nova proposta — ${numeroEditalReferencia}`}
      widthClass="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Tabela de itens do orçamento */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-body text-sm font-medium text-ink">Itens do orçamento</h3>
            <button
              type="button"
              onClick={adicionarItem}
              className="rounded-md border border-forest/40 px-3 py-1 font-body text-xs font-medium text-forest-deep hover:bg-forest-mist"
            >
              + Adicionar item
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-charcoal-3/10">
            <table className="w-full font-body text-sm">
              <thead className="bg-paper-2 text-left text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="w-24 px-3 py-2">Qtd.</th>
                  <th className="w-32 px-3 py-2">Valor unit. (R$)</th>
                  <th className="w-32 px-3 py-2">Subtotal</th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-3/10">
                {form.itens.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <input
                        value={item.descricao}
                        onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                        placeholder="Descrição do item"
                        className="w-full rounded-md border border-charcoal-3/20 px-2 py-1.5 focus:border-forest focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.id, 'quantidade', Number(e.target.value))}
                        className="w-full rounded-md border border-charcoal-3/20 px-2 py-1.5 focus:border-forest focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.valorUnitario}
                        onChange={(e) => atualizarItem(item.id, 'valorUnitario', Number(e.target.value))}
                        className="w-full rounded-md border border-charcoal-3/20 px-2 py-1.5 focus:border-forest focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-ink-soft">
                      {formatarMoeda(item.quantidade * item.valorUnitario)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removerItem(item.id)}
                        disabled={form.itens.length === 1}
                        className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Remover item"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex justify-end font-body text-sm">
            <span className="rounded-md bg-forest-mist px-3 py-1.5 font-medium text-forest-deep">
              Total da proposta: {formatarMoeda(total)}
            </span>
          </div>
        </div>

        {/* Condições e status */}
        <div className="grid grid-cols-3 gap-4">
          <InputField
            label="Validade (dias)"
            type="number"
            value={form.validadeDias}
            onChange={(v) => atualizarCampo('validadeDias', Number(v))}
          />
          <InputField
            label="Prazo de entrega (dias)"
            type="number"
            value={form.prazoEntregaDias ?? ''}
            onChange={(v) => atualizarCampo('prazoEntregaDias', v ? Number(v) : undefined)}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => mudarStatus(v as StatusProposta)}
            options={Object.entries(STATUS_PROPOSTA_LABEL).map(([value, label]) => ({ value, label }))}
          />
        </div>

        <TextAreaField
          label="Condições de pagamento"
          value={form.condicoesPagamento}
          onChange={(v) => atualizarCampo('condicoesPagamento', v)}
          rows={2}
          placeholder="Ex: 30/60/90 dias após entrega e aceite técnico"
        />

        <TextAreaField
          label="Observações"
          value={form.observacoes}
          onChange={(v) => atualizarCampo('observacoes', v)}
          rows={3}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-charcoal-3/10 pt-4 font-body text-sm">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-charcoal-3/20 px-4 py-2 text-ink hover:bg-paper-2"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSalvar}
          disabled={salvando}
          className="rounded-md bg-forest px-4 py-2 font-medium text-paper hover:bg-forest-deep disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar proposta'}
        </button>
      </div>
    </Modal>
  );
}

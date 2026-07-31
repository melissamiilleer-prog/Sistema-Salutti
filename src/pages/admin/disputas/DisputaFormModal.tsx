// src/pages/admin/disputas/DisputaFormModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/Modal';
import { InputField, SelectField, TextAreaField } from '../../../components/FormFields';
import {
  Disputa,
  DisputaFormData,
  ResultadoDisputa,
  RESULTADO_DISPUTA_LABEL,
} from '../../../types/disputa';

function criarFormularioVazio(licitacaoId: string): DisputaFormData {
  return {
    licitacaoId,
    dataSessaoRealizada: undefined,
    valorNossaOfertaFinal: undefined,
    valorVencedor: undefined,
    nomeVencedor: '',
    posicaoFinal: undefined,
    resultado: 'em_andamento',
    observacoes: '',
    linkAtaSigaPregao: '',
  };
}

interface DisputaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: DisputaFormData) => Promise<void>;
  licitacaoId: string;
  numeroEditalReferencia: string;
  disputaEmEdicao?: Disputa | null;
}

export function DisputaFormModal({
  isOpen,
  onClose,
  onSave,
  licitacaoId,
  numeroEditalReferencia,
  disputaEmEdicao,
}: DisputaFormModalProps) {
  const [form, setForm] = useState<DisputaFormData>(criarFormularioVazio(licitacaoId));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(disputaEmEdicao ? { ...disputaEmEdicao } : criarFormularioVazio(licitacaoId));
  }, [isOpen, disputaEmEdicao, licitacaoId]);

  function atualizarCampo<K extends keyof DisputaFormData>(campo: K, valor: DisputaFormData[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
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

  const resultadoMudaStatus = form.resultado === 'ganho' || form.resultado === 'perdido';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Disputa — ${numeroEditalReferencia}`}
      widthClass="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-charcoal-3/15 bg-paper-2 px-4 py-3 font-body text-xs text-ink-soft">
          A sessão de disputa acontece no <strong className="text-ink">SIGA Pregão</strong>. Use este
          formulário só para registrar o resultado final aqui no sistema, depois que a sessão ocorrer.
        </div>

        <SelectField
          label="Resultado"
          required
          value={form.resultado}
          onChange={(v) => atualizarCampo('resultado', v as ResultadoDisputa)}
          options={Object.entries(RESULTADO_DISPUTA_LABEL).map(([value, label]) => ({ value, label }))}
          hint={resultadoMudaStatus ? 'Isso vai atualizar automaticamente o status da licitação.' : undefined}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Data/hora da sessão realizada"
            type="datetime-local"
            value={form.dataSessaoRealizada?.slice(0, 16) ?? ''}
            onChange={(v) => atualizarCampo('dataSessaoRealizada', v ? new Date(v).toISOString() : undefined)}
          />
          <InputField
            label="Posição final"
            type="number"
            value={form.posicaoFinal ?? ''}
            onChange={(v) => atualizarCampo('posicaoFinal', v ? Number(v) : undefined)}
            placeholder="Ex: 1"
          />
          <InputField
            label="Nossa oferta final (R$)"
            type="number"
            value={form.valorNossaOfertaFinal ?? ''}
            onChange={(v) => atualizarCampo('valorNossaOfertaFinal', v ? Number(v) : undefined)}
          />
          <InputField
            label="Valor vencedor (R$)"
            type="number"
            value={form.valorVencedor ?? ''}
            onChange={(v) => atualizarCampo('valorVencedor', v ? Number(v) : undefined)}
          />
          <div className="col-span-2">
            <InputField
              label="Vencedor"
              value={form.nomeVencedor ?? ''}
              onChange={(v) => atualizarCampo('nomeVencedor', v)}
              placeholder='"Salutti" se ganhamos, ou nome do concorrente'
            />
          </div>
          <div className="col-span-2">
            <InputField
              label="Link da ata no SIGA Pregão"
              value={form.linkAtaSigaPregao ?? ''}
              onChange={(v) => atualizarCampo('linkAtaSigaPregao', v)}
              placeholder="https://app.sigapregao.com.br/ata/..."
            />
          </div>
        </div>

        <TextAreaField
          label="Observações"
          value={form.observacoes}
          onChange={(v) => atualizarCampo('observacoes', v)}
          rows={3}
          placeholder="Ex: motivo da perda, estratégia usada, aprendizados para a próxima disputa"
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
          {salvando ? 'Salvando...' : 'Salvar resultado'}
        </button>
      </div>
    </Modal>
  );
}

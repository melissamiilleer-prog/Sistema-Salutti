// src/pages/admin/licitacoes/LicitacaoFormModal.tsx
//
// Formulário de criação/edição de Licitação, em 5 abas — mesmo padrão dos
// módulos de Clientes e Funcionários descrito no README:
//   1. Dados do Edital
//   2. Datas e Prazos
//   3. Cliente Vinculado
//   4. Checklist
//   5. Observações / Histórico

import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/Modal';
import { Tabs } from '../../../components/Tabs';
import { InputField, SelectField, TextAreaField, CheckboxField } from '../../../components/FormFields';
import {
  Licitacao,
  LicitacaoFormData,
  ModalidadeLicitacao,
  MODALIDADE_LICITACAO_LABEL,
  StatusLicitacao,
  STATUS_LICITACAO_LABEL,
  CHECKLIST_PADRAO,
} from '../../../types/licitacao';
import { mockClientesResumo } from '../../../data/mockClientesResumo';
import { calcularPrazoInterno, formatarDataHora, classificarUrgenciaPrazo } from '../../../utils/prazoUtils';

const TABS = [
  { id: 'edital', label: 'Dados do Edital' },
  { id: 'prazos', label: 'Datas e Prazos' },
  { id: 'cliente', label: 'Cliente Vinculado' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'observacoes', label: 'Observações / Histórico' },
];

function criarFormularioVazio(): LicitacaoFormData {
  return {
    numeroEdital: '',
    orgao: '',
    modalidade: 'pregao_eletronico',
    objeto: '',
    portalOrigem: '',
    linkEdital: '',
    valorEstimado: 0,
    dataPublicacao: '',
    dataAberturaSessao: '',
    clienteId: '',
    status: 'pendente',
    checklist: CHECKLIST_PADRAO.map((c, i) => ({ ...c, id: `chk-${i + 1}` })),
    observacoes: '',
  };
}

interface LicitacaoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: LicitacaoFormData) => Promise<void>;
  licitacaoEmEdicao?: Licitacao | null;
}

export function LicitacaoFormModal({ isOpen, onClose, onSave, licitacaoEmEdicao }: LicitacaoFormModalProps) {
  const [abaAtiva, setAbaAtiva] = useState('edital');
  const [form, setForm] = useState<LicitacaoFormData>(criarFormularioVazio());
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAbaAtiva('edital');
    setForm(licitacaoEmEdicao ? { ...licitacaoEmEdicao } : criarFormularioVazio());
  }, [isOpen, licitacaoEmEdicao]);

  function atualizarCampo<K extends keyof LicitacaoFormData>(campo: K, valor: LicitacaoFormData[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarChecklistItem(id: string) {
    setForm((atual) => ({
      ...atual,
      checklist: atual.checklist.map((item) =>
        item.id === id ? { ...item, concluido: !item.concluido } : item
      ),
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

  const prazoInterno = form.dataAberturaSessao ? calcularPrazoInterno(form.dataAberturaSessao) : null;
  const urgencia = form.dataAberturaSessao ? classificarUrgenciaPrazo(form.dataAberturaSessao) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={licitacaoEmEdicao ? `Editar licitação — ${licitacaoEmEdicao.numeroEdital}` : 'Nova licitação'}
      widthClass="max-w-4xl"
    >
      <Tabs tabs={TABS} activeTab={abaAtiva} onChange={setAbaAtiva} />

      <div className="mt-5 min-h-[320px]">
        {abaAtiva === 'edital' && (
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Número do edital"
              required
              value={form.numeroEdital}
              onChange={(v) => atualizarCampo('numeroEdital', v)}
              placeholder="Ex: PE 045/2026"
            />
            <InputField
              label="Órgão"
              required
              value={form.orgao}
              onChange={(v) => atualizarCampo('orgao', v)}
              placeholder="Ex: Prefeitura Municipal de..."
            />
            <SelectField
              label="Modalidade"
              required
              value={form.modalidade}
              onChange={(v) => atualizarCampo('modalidade', v as ModalidadeLicitacao)}
              options={Object.entries(MODALIDADE_LICITACAO_LABEL).map(([value, label]) => ({ value, label }))}
            />
            <InputField
              label="Portal de origem"
              value={form.portalOrigem}
              onChange={(v) => atualizarCampo('portalOrigem', v)}
              placeholder="Ex: ComprasNet, BEC, Licitações-e"
            />
            <InputField
              label="Valor estimado (R$)"
              type="number"
              value={form.valorEstimado}
              onChange={(v) => atualizarCampo('valorEstimado', Number(v))}
            />
            <InputField
              label="Link do edital"
              value={form.linkEdital ?? ''}
              onChange={(v) => atualizarCampo('linkEdital', v)}
              placeholder="https://..."
            />
            <div className="col-span-2">
              <TextAreaField
                label="Objeto"
                required
                value={form.objeto}
                onChange={(v) => atualizarCampo('objeto', v)}
                placeholder="Descreva o objeto da licitação"
              />
            </div>
          </div>
        )}

        {abaAtiva === 'prazos' && (
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Data de publicação"
              type="date"
              value={form.dataPublicacao?.slice(0, 10) ?? ''}
              onChange={(v) => atualizarCampo('dataPublicacao', new Date(v).toISOString())}
            />
            <InputField
              label="Data/hora da sessão de abertura"
              type="datetime-local"
              value={form.dataAberturaSessao?.slice(0, 16) ?? ''}
              onChange={(v) => atualizarCampo('dataAberturaSessao', new Date(v).toISOString())}
            />
            {prazoInterno && (
              <div
                className={`col-span-2 rounded-lg border px-4 py-3 font-body text-sm ${
                  urgencia === 'vencido'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : urgencia === 'atencao'
                    ? 'border-brass/40 bg-brass-pale text-brass'
                    : 'border-forest/30 bg-forest-mist text-forest-deep'
                }`}
              >
                <strong>Prazo interno (regra de 3 dias úteis, 18h):</strong> {formatarDataHora(prazoInterno.toISOString())}
                {urgencia === 'vencido' && ' — já vencido!'}
                {urgencia === 'atencao' && ' — atenção, prazo próximo!'}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'cliente' && (
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Cliente vinculado"
              required
              value={form.clienteId}
              onChange={(v) => atualizarCampo('clienteId', v)}
              placeholder="Selecione um cliente"
              options={mockClientesResumo.map((c) => ({ value: c.id, label: c.nomeFantasia }))}
            />
            <SelectField
              label="Status"
              required
              value={form.status}
              onChange={(v) => atualizarCampo('status', v as StatusLicitacao)}
              options={Object.entries(STATUS_LICITACAO_LABEL).map(([value, label]) => ({ value, label }))}
            />
          </div>
        )}

        {abaAtiva === 'checklist' && (
          <div className="space-y-3">
            <p className="font-body text-sm text-ink-soft">
              Marque as etapas concluídas. Isso alimenta o andamento visível na Mesa de Trabalho.
            </p>
            {form.checklist.map((item) => (
              <CheckboxField
                key={item.id}
                label={item.etapa}
                checked={item.concluido}
                onChange={() => alternarChecklistItem(item.id)}
                hint={item.concluidoEm ? `Concluído em ${formatarDataHora(item.concluidoEm)}` : undefined}
              />
            ))}
          </div>
        )}

        {abaAtiva === 'observacoes' && (
          <div className="space-y-5">
            <TextAreaField
              label="Observações"
              value={form.observacoes}
              onChange={(v) => atualizarCampo('observacoes', v)}
              rows={4}
              placeholder="Observações internas sobre esta licitação"
            />
            {licitacaoEmEdicao && (
              <div>
                <h4 className="mb-2 font-body text-sm font-medium text-ink">Histórico de ações</h4>
                <ul className="space-y-2 rounded-lg border border-charcoal-3/10 bg-paper-2 p-3 font-mono text-xs text-ink-soft">
                  {licitacaoEmEdicao.historico.map((h) => (
                    <li key={h.id}>
                      {formatarDataHora(h.data)} — <span className="text-ink">{h.usuario}</span>: {h.acao}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
          {salvando ? 'Salvando...' : 'Salvar licitação'}
        </button>
      </div>
    </Modal>
  );
}

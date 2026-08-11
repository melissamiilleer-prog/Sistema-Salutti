// src/pages/admin/disputas/DisputaFormModal.tsx
//
// Registra o resultado de uma sessão de disputa já realizada no SIGA
// Pregão. Reescrito para usar os componentes genéricos REAIS do projeto
// (Modal, TextField, SelectField, TextAreaField, Button) — a versão
// anterior usava um conjunto de componentes duplicado (FormFields.tsx)
// com uma API incompatível (Modal isOpen/widthClass em vez de
// open/size; campos com onChange(value) em vez de onChange(event)),
// o que quebrava a compilação.

import { useEffect, useState } from 'react';
import { Modal } from '../../../components/Modal';
import { TextField } from '../../../components/TextField';
import { SelectField } from '../../../components/SelectField';
import { TextAreaField } from '../../../components/TextAreaField';
import { Button } from '../../../components/Button';
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
  numeroPregaoReferencia: string;
  disputaEmEdicao?: Disputa | null;
}

export function DisputaFormModal({
  isOpen,
  onClose,
  onSave,
  licitacaoId,
  numeroPregaoReferencia,
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
      open={isOpen}
      onClose={onClose}
      title={`Disputa — ${numeroPregaoReferencia}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar resultado'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-ink-soft/15 bg-forest-mist/30 px-4 py-3 font-body text-xs text-ink-soft">
          A sessão de disputa acontece no <strong className="text-ink">SIGA Pregão</strong>. Use este
          formulário só para registrar o resultado final aqui no sistema, depois que a sessão ocorrer.
        </div>

        <SelectField
          label="Resultado *"
          required
          value={form.resultado}
          onChange={(e) => atualizarCampo('resultado', e.target.value as ResultadoDisputa)}
          options={Object.entries(RESULTADO_DISPUTA_LABEL).map(([value, label]) => ({ value, label }))}
        />
        {resultadoMudaStatus && (
          <p className="-mt-3 font-body text-xs text-ink-soft">
            Isso vai atualizar automaticamente o status da licitação.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Data/hora da sessão realizada"
            type="datetime-local"
            value={form.dataSessaoRealizada?.slice(0, 16) ?? ''}
            onChange={(e) =>
              atualizarCampo('dataSessaoRealizada', e.target.value ? new Date(e.target.value).toISOString() : undefined)
            }
          />
          <TextField
            label="Posição final"
            type="number"
            value={form.posicaoFinal ?? ''}
            onChange={(e) => atualizarCampo('posicaoFinal', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 1"
          />
          <TextField
            label="Nossa oferta final (R$)"
            type="number"
            value={form.valorNossaOfertaFinal ?? ''}
            onChange={(e) =>
              atualizarCampo('valorNossaOfertaFinal', e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <TextField
            label="Valor vencedor (R$)"
            type="number"
            value={form.valorVencedor ?? ''}
            onChange={(e) => atualizarCampo('valorVencedor', e.target.value ? Number(e.target.value) : undefined)}
          />
          <div className="col-span-2">
            <TextField
              label="Vencedor"
              value={form.nomeVencedor ?? ''}
              onChange={(e) => atualizarCampo('nomeVencedor', e.target.value)}
              placeholder='"Salutti" se ganhamos, ou nome do concorrente'
            />
          </div>
          <div className="col-span-2">
            <TextField
              label="Link da ata no SIGA Pregão"
              value={form.linkAtaSigaPregao ?? ''}
              onChange={(e) => atualizarCampo('linkAtaSigaPregao', e.target.value)}
              placeholder="https://app.sigapregao.com.br/ata/..."
            />
          </div>
        </div>

        <TextAreaField
          label="Observações"
          value={form.observacoes}
          onChange={(e) => atualizarCampo('observacoes', e.target.value)}
          rows={3}
          placeholder="Ex: motivo da perda, estratégia usada, aprendizados para a próxima disputa"
        />
      </div>
    </Modal>
  );
}

// src/components/StatusPill.tsx
//
// Badge de status genérico, com "tom" (cor) configurável — usado para os
// status de Licitações/Propostas/Disputas, que têm 5+ variações (pendente,
// em análise, enviado, ganho, perdido, etc.), diferente do StatusBadge real
// do projeto (que é binário: só "ativo"/"inativo", usado em Clientes e
// Funcionários). Por isso este componente tem um NOME DIFERENTE — não deve
// substituir nem ser confundido com `components/StatusBadge.tsx` original.

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface StatusPillProps {
  label: string;
  tone: StatusTone;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'bg-ink-soft/10 text-ink-soft',
  success: 'bg-forest-mist text-forest-deep',
  warning: 'bg-brass-pale text-brass',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-forest-mist/60 text-forest-deep',
};

export function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

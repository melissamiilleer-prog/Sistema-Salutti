import { Link } from 'react-router-dom'
import { DashboardShell, StatCard } from '@/components/DashboardShell'
import { useAuth } from '@/context/AuthContext'

export function AdminDashboard() {
  const { user } = useAuth()

  return (
    <DashboardShell
      title={`Olá, ${user?.name ?? 'Administrador'}`}
      subtitle="Visão geral do sistema — dados de exemplo, prontos para conectar a dados reais."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Usuários ativos" value="24" hint="12 clientes, 8 funcionários, 4 admins" />
        <StatCard label="Licitações em análise" value="17" />
        <StatCard label="Editais publicados hoje" value="5" />
        <StatCard label="Alertas pendentes" value="3" hint="Requerem atenção" />
      </div>

      <div className="mt-8 rounded-xl border border-ink-soft/10 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-forest-deep">
          Área do administrador
        </h2>
        <p className="mt-2 font-body text-sm text-ink-soft">
          Aqui entrarão, nas próximas etapas: gestão de usuários e permissões,
          configurações do sistema e relatórios consolidados. Cadastro de
          Clientes e de Funcionários são exclusivos do perfil{' '}
          <strong>Administrador</strong>; Licitações, Disputas e Relatórios
          também são acessíveis pelo perfil <strong>Funcionário</strong>.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            to="/admin/clientes"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Cadastro de Clientes →
          </Link>
          <Link
            to="/admin/funcionarios"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Cadastro de Funcionários →
          </Link>
          <Link
            to="/admin/licitacoes"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Licitações →
          </Link>
          <Link
            to="/admin/disputas"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Disputas →
          </Link>
          <Link
            to="/admin/relatorios"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Relatórios →
          </Link>
          <Link
            to="/admin/configuracoes"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Configurações →
          </Link>
        </div>
      </div>
    </DashboardShell>
  )
}

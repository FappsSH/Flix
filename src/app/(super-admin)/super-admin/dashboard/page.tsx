import { getDashboardMetrics, getRecentTenants, getRevenueChartData } from '@/actions/super-admin/dashboard'
import { StatsCard } from '@/components/super-admin/stats-card'
import { RevenueChart } from '@/components/super-admin/revenue-chart'
import { RecentTenants } from '@/components/super-admin/recent-tenants'
import { Building2, TrendingUp, Users, BookOpen, DollarSign, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function SuperAdminDashboard() {
  const metricsResult = await getDashboardMetrics()
  const recentTenantsResult = await getRecentTenants(5)
  const revenueChartResult = await getRevenueChartData()

  if (!metricsResult.success || !metricsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Erro ao carregar métricas do dashboard</p>
      </div>
    )
  }

  const metrics = metricsResult.data
  const recentTenants = recentTenantsResult.success ? recentTenantsResult.data : []
  const revenueData = revenueChartResult.success ? revenueChartResult.data : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-secondary mt-2">
          Visão geral da plataforma e faturamento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatsCard
          title="Total de Tenants"
          value={metrics.totalTenants}
          icon={Building2}
          trend={metrics.newTenantsThisMonth > 0 ? `+${metrics.newTenantsThisMonth} este mês` : undefined}
        />
        <StatsCard
          title="MRR (Receita Mensal)"
          value={formatCurrency(metrics.mrr)}
          icon={DollarSign}
          trend={metrics.mrrGrowth > 0 ? `+${metrics.mrrGrowth.toFixed(1)}%` : undefined}
          trendUp={metrics.mrrGrowth > 0}
        />
        <StatsCard
          title="ARR (Receita Anual)"
          value={formatCurrency(metrics.arr)}
          icon={TrendingUp}
        />
        <StatsCard
          title="Assinaturas Ativas"
          value={metrics.activeSubscriptions}
          icon={Building2}
          description="Tenants com pagamento em dia"
        />
        <StatsCard
          title="Em Trial"
          value={metrics.tenantsInTrial}
          icon={Building2}
          description="Tenants testando a plataforma"
        />
        <StatsCard
          title="Pagamento Atrasado"
          value={metrics.pastDueSubscriptions}
          icon={AlertCircle}
          description="Requer atenção"
          variant="warning"
        />
        <StatsCard
          title="Total de Alunos"
          value={metrics.totalStudents}
          icon={Users}
          description="Em todos os tenants"
        />
        <StatsCard
          title="Total de Cursos"
          value={metrics.totalCourses}
          icon={BookOpen}
          description="Em todos os tenants"
        />
      </div>

      {/* Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData || []} />
        </div>

        {/* Recent Tenants */}
        <div className="lg:col-span-1">
          <RecentTenants tenants={recentTenants || []} />
        </div>
      </div>
    </div>
  )
}

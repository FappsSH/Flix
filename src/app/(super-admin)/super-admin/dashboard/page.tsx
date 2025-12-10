import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, TrendingUp, Users, BookOpen, DollarSign, AlertCircle } from 'lucide-react'

export default function SuperAdminDashboard() {
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
        {/* Total de Tenants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-text-secondary mt-1">
              +2 este mês
            </p>
          </CardContent>
        </Card>

        {/* MRR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Mensal)</CardTitle>
            <DollarSign className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.500</div>
            <p className="text-xs text-success mt-1">
              +15.3%
            </p>
          </CardContent>
        </Card>

        {/* ARR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR (Receita Anual)</CardTitle>
            <TrendingUp className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 150.000</div>
            <p className="text-xs text-text-secondary mt-1">
              Projeção anual
            </p>
          </CardContent>
        </Card>

        {/* Assinaturas Ativas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-text-secondary mt-1">
              Tenants com pagamento em dia
            </p>
          </CardContent>
        </Card>

        {/* Em Trial */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trial</CardTitle>
            <Building2 className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-text-secondary mt-1">
              Testando a plataforma
            </p>
          </CardContent>
        </Card>

        {/* Pagamento Atrasado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamento Atrasado</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">1</div>
            <p className="text-xs text-text-secondary mt-1">
              Requer atenção
            </p>
          </CardContent>
        </Card>

        {/* Total de Alunos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.234</div>
            <p className="text-xs text-text-secondary mt-1">
              Em todos os tenants
            </p>
          </CardContent>
        </Card>

        {/* Total de Cursos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-text-secondary mt-1">
              Em todos os tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background-card rounded-lg border border-secondary">
              <div>
                <p className="font-semibold text-text">Academia XYZ</p>
                <p className="text-sm text-text-secondary">academia-xyz.flix.com</p>
              </div>
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                Trial
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-background-card rounded-lg border border-secondary">
              <div>
                <p className="font-semibold text-text">Escola Tech</p>
                <p className="text-sm text-text-secondary">escolatech.flix.com</p>
              </div>
              <span className="px-3 py-1 bg-success/20 text-success text-sm rounded-full">
                Ativo
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-background-card rounded-lg border border-secondary">
              <div>
                <p className="font-semibold text-text">Cursos Online Brasil</p>
                <p className="text-sm text-text-secondary">cursos.brasil.com</p>
              </div>
              <span className="px-3 py-1 bg-success/20 text-success text-sm rounded-full">
                Ativo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

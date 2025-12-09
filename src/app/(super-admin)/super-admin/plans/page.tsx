import { getAllPlans } from '@/actions/super-admin/plans'
import { PlansClient } from '@/components/super-admin/plans-client'

export default async function PlansPage() {
  const result = await getAllPlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planos</h1>
          <p className="text-muted-foreground">
            Gerencie os planos de assinatura disponíveis
          </p>
        </div>
      </div>

      <PlansClient plans={result.success ? result.data : []} />
    </div>
  )
}

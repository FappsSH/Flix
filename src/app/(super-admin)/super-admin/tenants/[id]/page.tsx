import { notFound, redirect } from 'next/navigation'
import { getTenantById } from '@/actions/super-admin/tenants'
import { TenantDetailsClient } from '@/components/super-admin/tenant-details-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TenantDetailsPage({ params }: PageProps) {
  const result = await getTenantById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <TenantDetailsClient tenant={result.data} />
}

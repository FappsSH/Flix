import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: string
  trendUp?: boolean
  variant?: 'default' | 'warning' | 'success'
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
  variant = 'default',
}: StatsCardProps) {
  return (
    <Card className={cn(
      variant === 'warning' && 'border-warning',
      variant === 'success' && 'border-success'
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-3xl font-bold text-text mt-2">{value}</p>
            {description && (
              <p className="text-xs text-text-muted mt-1">{description}</p>
            )}
            {trend && (
              <p className={cn(
                'text-sm font-medium mt-2',
                trendUp ? 'text-success' : 'text-error'
              )}>
                {trend}
              </p>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            variant === 'default' && 'bg-primary/10',
            variant === 'warning' && 'bg-warning/10',
            variant === 'success' && 'bg-success/10'
          )}>
            <Icon className={cn(
              'h-6 w-6',
              variant === 'default' && 'text-primary',
              variant === 'warning' && 'text-warning',
              variant === 'success' && 'text-success'
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

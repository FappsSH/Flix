'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { LineChart, TrendingUp } from 'lucide-react'

interface RevenueChartProps {
  data: {
    month: string
    mrr: number
  }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal Recorrente (MRR)</CardTitle>
          <CardDescription>Últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-text-muted">
            <LineChart className="h-12 w-12 mr-2" />
            <p>Sem dados para exibir</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.mrr))
  const currentMrr = data[data.length - 1]?.mrr || 0
  const previousMrr = data[data.length - 2]?.mrr || 0
  const growth = previousMrr > 0 ? ((currentMrr - previousMrr) / previousMrr) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Receita Mensal Recorrente (MRR)</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-text">{formatCurrency(currentMrr)}</p>
            {growth !== 0 && (
              <p className={`text-sm font-medium flex items-center justify-end gap-1 ${growth > 0 ? 'text-success' : 'text-error'}`}>
                <TrendingUp className="h-4 w-4" />
                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple bar chart visualization */}
        <div className="space-y-4">
          {data.slice(-6).map((item, index) => {
            const percentage = maxValue > 0 ? (item.mrr / maxValue) * 100 : 0
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{item.month}</span>
                  <span className="text-text font-semibold">{formatCurrency(item.mrr)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

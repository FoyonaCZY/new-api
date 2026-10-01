/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import {
  formatLatency,
  formatThroughput,
  formatUptimePct,
  getSuccessRateDotClass,
  getSuccessRateTextClass,
} from '@/features/performance-metrics/lib/format'
import { requireServerSuccess } from '@/lib/server-error-message'
import { cn } from '@/lib/utils'

const PERFORMANCE_WINDOW_HOURS = 24
const TOP_MODEL_LIMIT = 6

export function PerformanceHealthPanel() {
  const { t } = useTranslation()
  const metricsQuery = useQuery({
    queryKey: ['perf-metrics-summary', PERFORMANCE_WINDOW_HOURS],
    queryFn: async () =>
      requireServerSuccess(
        await getPerfMetricsSummary(PERFORMANCE_WINDOW_HOURS)
      ),
    staleTime: 60 * 1000,
    retry: false,
  })

  const models = useMemo(
    () => metricsQuery.data?.data.models ?? [],
    [metricsQuery.data]
  )

  const summary = metricsQuery.data?.data.summary

  const topModels = useMemo(() => models.slice(0, TOP_MODEL_LIMIT), [models])
  const loading = metricsQuery.isLoading
  const hasData = models.length > 0

  return (
    <Card className='h-full min-w-0 gap-0 rounded-lg border-0 p-5 shadow-none sm:p-6'>
      <div className='flex flex-wrap items-baseline justify-between gap-2 pb-5'>
        <h3 className='text-lg font-medium tracking-tight'>
          {t('Performance health')}
        </h3>
        <span className='text-muted-foreground text-xs'>
          {t('Performance metrics for the last 24 hours')}
        </span>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='bg-muted/45 grid grid-cols-1 gap-3 rounded-md p-1 sm:grid-cols-3'>
          <MetricCell
            label={t('Success rate')}
            value={formatUptimePct(summary?.success_rate ?? Number.NaN)}
            loading={loading}
            valueClassName={getSuccessRateTextClass(
              summary?.success_rate ?? Number.NaN
            )}
          />
          <MetricCell
            label={t('Average latency')}
            value={formatLatency(summary?.avg_latency_ms ?? 0)}
            loading={loading}
          />
          <MetricCell
            label={t('Throughput')}
            value={formatThroughput(summary?.avg_tps ?? 0)}
            loading={loading}
          />
        </div>

        {loading ? (
          <div className='flex flex-col gap-1'>
            {['success', 'latency', 'throughput'].map((key) => (
              <Skeleton key={key} className='h-5 w-full rounded' />
            ))}
          </div>
        ) : (
          hasData && (
            <div>
              <h4 className='text-muted-foreground mb-2 text-xs font-medium'>
                {t('Top models by traffic')}
              </h4>
              <div className='grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2'>
                {topModels.map((model) => (
                  <div
                    key={model.model_name}
                    className='bg-muted/25 flex items-center justify-between gap-3 rounded-sm px-3 py-3'
                  >
                    <span className='min-w-0 flex-1 font-mono text-xs break-all'>
                      {model.model_name}
                    </span>
                    <span className='inline-flex shrink-0 items-center gap-1'>
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          getSuccessRateDotClass(model.success_rate)
                        )}
                        aria-hidden='true'
                      />
                      <span
                        className={cn(
                          'font-mono text-xs tabular-nums',
                          getSuccessRateTextClass(model.success_rate)
                        )}
                      >
                        {formatUptimePct(model.success_rate)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  )
}

function MetricCell(props: {
  label: string
  value: string
  loading: boolean
  valueClassName?: string
}) {
  return (
    <div className='min-w-0 px-4 py-3'>
      <div className='text-muted-foreground text-xs'>{props.label}</div>
      {props.loading ? (
        <Skeleton className='mt-1.5 h-5 w-16' />
      ) : (
        <div
          className={cn(
            'mt-3 font-serif text-3xl tracking-tight break-words tabular-nums',
            props.valueClassName
          )}
        >
          {props.value}
        </div>
      )}
    </div>
  )
}

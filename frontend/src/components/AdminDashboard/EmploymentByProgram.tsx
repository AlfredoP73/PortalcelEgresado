'use client'

import { useEffect, useState } from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from './Ui/chart'

import {
  getDashboard,
  type DashboardData,
} from '../../api/dashboardServices'

const chartConfig = {
  percentage: {
    label: 'Empleabilidad',
    color: 'var(--color-brand-500)',
  },
} satisfies ChartConfig

export function EmploymentByProgram() {
  const [data, setData] = useState<
    DashboardData['employment_by_program']
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)

        const dashboard = await getDashboard()

        setData(dashboard.employment_by_program)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <section className="card p-5">
        <h2 className="text-base font-semibold text-ink">
          Empleabilidad por programa académico
        </h2>

        <div className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-ink-secondary">
            Cargando datos...
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="card p-5">
        <h2 className="text-base font-semibold text-ink">
          Empleabilidad por programa académico
        </h2>

        <div className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </section>
    )
  }

  if (data.length === 0) {
    return (
      <section className="card p-5">
        <h2 className="text-base font-semibold text-ink">
          Empleabilidad por programa académico
        </h2>

        <div className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-ink-secondary">
            No hay datos disponibles todavía.
          </p>
        </div>
      </section>
    )
  }

  const average = Math.round(
    data.reduce(
      (sum, item) => sum + item.percentage,
      0
    ) / data.length
  )

  const topValue = Math.max(
    ...data.map((item) => item.percentage)
  )

  return (
    <section
      aria-label="Empleabilidad por programa académico"
      className="card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Empleabilidad por programa académico
          </h2>

          <p className="mt-1 text-xs text-ink-secondary">
            Porcentaje de egresados empleados
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800">
          Promedio {average}%
        </span>
      </div>

      <ChartContainer
        config={chartConfig}
        className="mt-4 h-[260px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{
            left: 8,
            right: 32,
          }}
        >
          <CartesianGrid
            horizontal={false}
            vertical={false}
          />

          <XAxis
            type="number"
            domain={[0, 100]}
            hide
          />

          <YAxis
            type="category"
            dataKey="program"
            tickLine={false}
            axisLine={false}
            width={140}
            tick={{
              fontSize: 12,
              fill: 'var(--text-secondary)',
            }}
            tickFormatter={(value: string) =>
              value.length > 22
                ? `${value.slice(0, 21)}…`
                : value
            }
          />

          <ReferenceLine
            x={average}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{
              value: 'Prom.',
              position: 'top',
              fill: 'var(--text-muted)',
              fontSize: 10,
            }}
          />

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => `${value}%`}
              />
            }
          />

          <Bar
            dataKey="percentage"
            radius={[0, 6, 6, 0]}
            barSize={22}
          >
            {data.map((entry) => (
              <Cell
                key={entry.program}
                fill={
                  entry.percentage === topValue
                    ? 'var(--color-brand-500)'
                    : 'var(--color-brand-300)'
                }
              />
            ))}

            <LabelList
              dataKey="percentage"
              position="right"
              offset={8}
              fill="var(--text-secondary)"
              fontSize={12}
              formatter={(value) => `${value}%`}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </section>
  )
}

export default EmploymentByProgram
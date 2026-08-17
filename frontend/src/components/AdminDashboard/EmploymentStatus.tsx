'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  PolarGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import {
  getDashboard,
  type DashboardData,
} from '../../api/dashboardServices'

interface Props { programId?: number; year?: number; }
export function EmploymentStatus({ programId, year }: Props) {
  const [data, setData] = useState<
    DashboardData['application_status']
  >([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true); const dashboard = await getDashboard(programId, year)

        setData(dashboard.application_status)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [programId, year])

  const total = useMemo(
    () =>
      data.reduce(
        (sum, item) => sum + item.count,
        0
      ),
    [data]
  )

  return (
    <section className="card p-5">
      <div>
        <h2 className="text-base font-semibold text-ink">
          Estado de empleabilidad
        </h2>

        <p className="mt-1 text-xs text-ink-secondary">
          Distribución actual de las postulaciones
        </p>
      </div>

      {loading ? (
        <div className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-ink-secondary">
            Cargando datos...
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-ink-secondary">
            No hay datos disponibles todavía.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.5fr]">
          <div className="h-[240px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="90%"
                barSize={22}
                data={data.map((item, index) => ({
                  ...item,
                  fill:
                    index % 2 === 0
                      ? 'var(--color-brand-500)'
                      : 'var(--color-brand-300)',
                }))}
                startAngle={90}
                endAngle={-270}
              >
                <PolarGrid
                  gridType="circle"
                  stroke="var(--border-color)"
                />

                <RadialBar
                  background={{
                    fill: 'var(--bg-muted)',
                  }}
                  dataKey="count"
                  cornerRadius={10}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.map((item, index) => {
              const percentage =
                total > 0
                  ? Math.round(
                      (item.count / total) * 100
                    )
                  : 0

              return (
                <div
                  key={item.status}
                  className="rounded-xl border border-black/5 bg-surface-soft p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? 'var(--color-brand-500)'
                            : 'var(--color-brand-300)',
                      }}
                    />

                    <span className="text-xs font-medium uppercase text-ink-secondary">
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-2 text-3xl font-semibold text-ink">
                    {percentage}%
                  </p>

                  <p className="mt-1 text-xs text-ink-secondary">
                    {item.count}{' '}
                    {item.count === 1
                      ? 'postulación'
                      : 'postulaciones'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default EmploymentStatus

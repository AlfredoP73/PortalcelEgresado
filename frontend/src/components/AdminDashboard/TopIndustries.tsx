'use client'

import { useEffect, useState } from 'react'

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import {
  getDashboard,
  type DashboardData,
} from '../../api/dashboardServices'

const INDUSTRY_COLORS = [
  'var(--color-brand-500)',
  'var(--color-brand-400)',
  'var(--color-brand-300)',
  'var(--color-brand-600)',
  'var(--color-brand-700)',
]

interface Props { programId?: number; year?: number; }
export function TopIndustries({ programId, year }: Props) {
  const [data, setData] = useState<
    DashboardData['industries']
  >([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true); const dashboard = await getDashboard(programId, year)
        setData(dashboard.industries)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [programId, year])

  return (
    <section className="card p-5">
      <div>
        <h2 className="text-base font-semibold text-ink">
          Industrias con mayor contratación
        </h2>

        <p className="mt-1 text-xs text-ink-secondary">
          Sectores donde trabajan los egresados
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
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="percentage"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.sector}
                      fill={
                        INDUSTRY_COLORS[
                          index % INDUSTRY_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                  }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center gap-3">
            {data.map((item, index) => (
              <div
                key={item.sector}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        INDUSTRY_COLORS[
                          index % INDUSTRY_COLORS.length
                        ],
                    }}
                  />

                  <span className="text-sm text-ink-secondary">
                    {item.sector}
                  </span>
                </div>

                <span className="text-sm font-semibold text-ink">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default TopIndustries

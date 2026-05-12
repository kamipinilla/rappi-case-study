import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Measurement, Zone } from '../data/MetricAnalyzer'
import { getCompanyAccentColor } from '../utils/CompanyAccentColor'

type ZoneTrendChartProps = {
  zone: Zone
  referenceCompanyName: string
  comparisonCompanyName: string
  isSatisfactionMetric: boolean
}

type ChartPoint = {
  weeksAgo: number
  label: string
  referenceValue: number | null
  comparisonValue: number | null
}

const weeksAgoLabels = [8, 7, 6, 5, 4, 3, 2, 1, 0]

const valueFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

function formatWeeksAgoLabel(label: unknown): string {
  const weeksAgo = Number(label)

  if (!Number.isFinite(weeksAgo)) {
    return String(label)
  }

  if (weeksAgo === 0) {
    return 'Esta semana'
  }

  return `Hace ${weeksAgo} semana${weeksAgo === 1 ? '' : 's'}`
}

function getMeasurementValueByWeek(
  measurements: Measurement[],
): Map<number, number> {
  return new Map(
    measurements.map((measurement) => [
      measurement.weeksAgo,
      measurement.value,
    ]),
  )
}

function mapChartData(zone: Zone): ChartPoint[] {
  const referenceMeasurements = getMeasurementValueByWeek(
    zone.referenceData.measurements,
  )
  const comparisonMeasurements = getMeasurementValueByWeek(
    zone.comparisonData.measurements,
  )

  return weeksAgoLabels.map((weeksAgo) => ({
    weeksAgo,
    label: String(weeksAgo),
    referenceValue: referenceMeasurements.get(weeksAgo) ?? null,
    comparisonValue: comparisonMeasurements.get(weeksAgo) ?? null,
  }))
}

export function ZoneTrendChart({
  zone,
  referenceCompanyName,
  comparisonCompanyName,
  isSatisfactionMetric,
}: ZoneTrendChartProps) {
  const chartData = mapChartData(zone)
  const referenceCompanyAccentColor =
    getCompanyAccentColor(referenceCompanyName)
  const comparisonCompanyAccentColor = getCompanyAccentColor(
    comparisonCompanyName,
  )

  return (
    <section className="flex h-full min-h-[26rem] flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <h2 className="truncate font-['Nunito'] text-base font-normal text-slate-950">
          {zone.name}
        </h2>
        <p className="text-sm text-slate-500">Tendencia por semanas</p>
      </div>

      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 48, bottom: 16, left: 8 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              interval={0}
              minTickGap={0}
              textAnchor="middle"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              padding={{ left: 28, right: 48 }}
              height={32}
            />
            <YAxis
              domain={isSatisfactionMetric ? [0, 5] : undefined}
              ticks={isSatisfactionMetric ? [0, 1, 2, 3, 4, 5] : undefined}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => valueFormatter.format(Number(value))}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value) => valueFormatter.format(Number(value))}
              labelFormatter={formatWeeksAgoLabel}
              labelStyle={{ color: '#0f172a' }}
              separator=": "
            />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
            <ReferenceLine
              y={zone.referenceData.value}
              stroke={referenceCompanyAccentColor}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              y={zone.comparisonData.value}
              stroke={comparisonCompanyAccentColor}
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="referenceValue"
              name={referenceCompanyName}
              stroke={referenceCompanyAccentColor}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="comparisonValue"
              name={comparisonCompanyName}
              stroke={comparisonCompanyAccentColor}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

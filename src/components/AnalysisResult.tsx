import { useEffect, useMemo, useState } from 'react'

import type { Response as MetricAnalysisResponse } from '../data/MetricAnalyzer'
import { ZoneDifferenceList } from './ZoneDifferenceList'
import { ZoneTrendChart } from './ZoneTrendChart'

type AnalysisResultProps = {
  result: MetricAnalysisResponse | null
  error: string | null
  referenceCompanyName: string
  comparisonCompanyName: string
  metricDisplayName: string
  metricUnitLabel: string
  isSatisfactionMetric: boolean
}

export function AnalysisResult({
  result,
  error,
  referenceCompanyName,
  comparisonCompanyName,
  metricDisplayName,
  metricUnitLabel,
  isSatisfactionMetric,
}: AnalysisResultProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedZoneId(result?.zones[0]?.id ?? null)
  }, [result])

  const selectedZone = useMemo(() => {
    if (!result || !selectedZoneId) {
      return null
    }

    return (
      result.zones.find((zone) => zone.id === selectedZoneId) ??
      result.zones[0] ??
      null
    )
  }, [result, selectedZoneId])

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        {error}
      </section>
    )
  }

  if (!result) {
    return null
  }

  if (result.zones.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          No hay zonas en esta base de datos donde {comparisonCompanyName} tenga
          mejor {metricDisplayName} que {referenceCompanyName}.
        </p>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-2">
      <ZoneDifferenceList
        zones={result.zones}
        referenceCompanyName={referenceCompanyName}
        comparisonCompanyName={comparisonCompanyName}
        metricUnitLabel={metricUnitLabel}
        selectedZoneId={selectedZone?.id ?? null}
        onZoneSelect={setSelectedZoneId}
      />
      {selectedZone ? (
        <ZoneTrendChart
          zone={selectedZone}
          referenceCompanyName={referenceCompanyName}
          comparisonCompanyName={comparisonCompanyName}
          isSatisfactionMetric={isSatisfactionMetric}
        />
      ) : null}
    </section>
  )
}

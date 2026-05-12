import { useEffect, useState } from 'react'

import { dataService as defaultDataService } from '../di/DataServiceInjection'
import type { Company } from '../data/CompanyRepo'
import type { DataService } from '../data/DataService'
import type { Response as MetricAnalysisResponse } from '../data/MetricAnalyzer'
import type { Metric } from '../data/MetricRepo'
import { AnalysisResult } from '../components/AnalysisResult'
import { MetricAnalysisFormV2 } from '../components/MetricAnalysisFormV2'
import {
  getMetricDisplayNameByName,
  getMetricUnitLabelByName,
  isSatisfactionMetric,
} from '../utils/MetricDisplayName'

type AnalyticsScreenProps = {
  dataService?: DataService
}

const DEFAULT_REFERENCE_COMPANY_NAME = 'Rappi'
const DEFAULT_COMPARISON_COMPANY_NAME = 'Uber Eats'
const DEFAULT_METRIC_NAME = 'Avg Delivery Time (mins)'

export function AnalyticsScreen({
  dataService = defaultDataService,
}: AnalyticsScreenProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [referenceCompanyId, setReferenceCompanyId] = useState('')
  const [comparisonCompanyId, setComparisonCompanyId] = useState('')
  const [metricId, setMetricId] = useState('')
  const [result, setResult] = useState<MetricAnalysisResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadReferenceData() {
      try {
        const [loadedCompanies, loadedMetrics] = await Promise.all([
          dataService.getCompanies(),
          dataService.getMetrics(),
        ])

        if (!isActive) {
          return
        }

        setCompanies(loadedCompanies)
        setMetrics(loadedMetrics)
        setReferenceCompanyId(
          loadedCompanies.find(
            (company) => company.name === DEFAULT_REFERENCE_COMPANY_NAME,
          )?.id ??
            loadedCompanies[0]?.id ??
            '',
        )
        setComparisonCompanyId(
          loadedCompanies.find(
            (company) => company.name === DEFAULT_COMPARISON_COMPANY_NAME,
          )?.id ??
            loadedCompanies[1]?.id ??
            loadedCompanies[0]?.id ??
            '',
        )
        setMetricId(
          loadedMetrics.find((metric) => metric.name === DEFAULT_METRIC_NAME)
            ?.id ??
            loadedMetrics[0]?.id ??
            '',
        )
      } catch {
        if (isActive) {
          setLoadError('No fue posible cargar las compañías y métricas.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadReferenceData()

    return () => {
      isActive = false
    }
  }, [dataService])

  const handleReferenceCompanyChange = (value: string) => {
    if (value === comparisonCompanyId) {
      setComparisonCompanyId(referenceCompanyId)
    }

    setReferenceCompanyId(value)
  }

  const handleComparisonCompanyChange = (value: string) => {
    if (value === referenceCompanyId) {
      setReferenceCompanyId(comparisonCompanyId)
    }

    setComparisonCompanyId(value)
  }

  useEffect(() => {
    if (
      isLoading ||
      loadError ||
      !referenceCompanyId ||
      !comparisonCompanyId ||
      !metricId
    ) {
      return
    }

    let isActive = true

    async function analyzeMetric() {
      try {
        const analysis = await dataService.analyzeMetric(
          referenceCompanyId,
          comparisonCompanyId,
          metricId,
        )

        if (isActive) {
          setResult(analysis)
        }
      } catch {
        if (isActive) {
          setAnalysisError('No fue posible analizar la métrica seleccionada.')
        }
      } finally {
        if (isActive) {
          setIsSubmitting(false)
        }
      }
    }

    setIsSubmitting(true)
    setAnalysisError(null)
    setResult(null)
    analyzeMetric()

    return () => {
      isActive = false
    }
  }, [
    comparisonCompanyId,
    dataService,
    isLoading,
    loadError,
    metricId,
    referenceCompanyId,
  ])

  const isFormDisabled = isLoading || Boolean(loadError)
  const referenceCompanyName =
    companies.find((company) => company.id === referenceCompanyId)?.name ?? ''
  const comparisonCompanyName =
    companies.find((company) => company.id === comparisonCompanyId)?.name ?? ''
  const metricName = metrics.find((metric) => metric.id === metricId)?.name ?? ''
  const metricDisplayName = getMetricDisplayNameByName(metricName)
  const metricUnitLabel = getMetricUnitLabelByName(metricName)
  const shouldUseSatisfactionScale = isSatisfactionMetric(metricName)

  return (
    <main className="min-h-screen bg-slate-50 px-2 py-2 text-slate-950 sm:px-3 sm:py-3">
      <div className="flex w-full flex-col gap-2 sm:gap-3">
        {loadError ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            {loadError}
          </section>
        ) : (
          <MetricAnalysisFormV2
            companies={companies}
            metrics={metrics}
            referenceCompanyId={referenceCompanyId}
            comparisonCompanyId={comparisonCompanyId}
            metricId={metricId}
            isDisabled={isFormDisabled}
            onReferenceCompanyChange={handleReferenceCompanyChange}
            onComparisonCompanyChange={handleComparisonCompanyChange}
            onMetricChange={setMetricId}
          />
        )}

        {isLoading ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            Cargando compañías y métricas...
          </section>
        ) : isSubmitting ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            Analizando...
          </section>
        ) : (
          <AnalysisResult
            result={result}
            error={analysisError}
            referenceCompanyName={referenceCompanyName}
            comparisonCompanyName={comparisonCompanyName}
            metricDisplayName={metricDisplayName}
            metricUnitLabel={metricUnitLabel}
            isSatisfactionMetric={shouldUseSatisfactionScale}
          />
        )}
      </div>
    </main>
  )
}

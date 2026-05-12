import type { CSSProperties, ReactNode } from 'react'

import type { Company } from '../data/CompanyRepo'
import type { Metric } from '../data/MetricRepo'
import {
  DEFAULT_ACCENT_COLOR,
  getCompanyAccentColor,
} from '../utils/CompanyAccentColor'
import {
  getMetricDisplayName,
  getMetricDisplayNameByName,
} from '../utils/MetricDisplayName'

type MetricAnalysisFormV2Props = {
  companies: Company[]
  metrics: Metric[]
  referenceCompanyId: string
  comparisonCompanyId: string
  metricId: string
  isDisabled: boolean
  onReferenceCompanyChange: (value: string) => void
  onComparisonCompanyChange: (value: string) => void
  onMetricChange: (value: string) => void
}

type InlineSelectProps = {
  id: string
  ariaLabel: string
  value: string
  disabled: boolean
  selectedLabel: string
  accentColor?: string
  children: ReactNode
  onChange: (value: string) => void
}

function InlineSelect({
  id,
  ariaLabel,
  value,
  disabled,
  selectedLabel,
  accentColor,
  children,
  onChange,
}: InlineSelectProps) {
  const widthLabel = selectedLabel || ariaLabel
  const resolvedAccentColor = accentColor ?? DEFAULT_ACCENT_COLOR
  const accentStyle: CSSProperties = {
    borderColor: resolvedAccentColor,
    boxShadow: `0 0 0 1px ${resolvedAccentColor}`,
  }

  return (
    <span className="relative inline-block min-w-0 max-w-full align-middle">
      <span
        aria-hidden="true"
        className="block min-h-10 max-w-full overflow-hidden whitespace-pre rounded-full border border-transparent px-4 py-2 text-base font-normal"
      >
        {widthLabel}
      </span>
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        style={accentStyle}
        className="absolute inset-0 h-full w-full appearance-none truncate rounded-full border border-[#ff441f] bg-white px-4 py-2 text-center text-base font-normal text-slate-950 shadow-[0_0_0_1px_#ff441f] outline-none transition focus:ring-2 focus:ring-[#ff441f]/20 disabled:cursor-not-allowed disabled:border-[#ff441f] disabled:bg-slate-100 disabled:text-slate-500"
      >
        {children}
      </select>
    </span>
  )
}

export function MetricAnalysisFormV2({
  companies,
  metrics,
  referenceCompanyId,
  comparisonCompanyId,
  metricId,
  isDisabled,
  onReferenceCompanyChange,
  onComparisonCompanyChange,
  onMetricChange,
}: MetricAnalysisFormV2Props) {
  const referenceCompanyName =
    companies.find((company) => company.id === referenceCompanyId)?.name ?? ''
  const comparisonCompanyName =
    companies.find((company) => company.id === comparisonCompanyId)?.name ?? ''
  const metricName =
    metrics.find((metric) => metric.id === metricId)?.name ?? ''
  const metricDisplayName = getMetricDisplayNameByName(metricName)

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-3 text-center text-lg font-medium leading-[2.75rem] text-slate-950">
        <span>¿En cuáles zonas tiene</span>
        <InlineSelect
          id="comparison-company"
          ariaLabel="Compañía de comparación"
          value={comparisonCompanyId}
          disabled={isDisabled}
          selectedLabel={comparisonCompanyName}
          accentColor={getCompanyAccentColor(comparisonCompanyName)}
          onChange={onComparisonCompanyChange}
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </InlineSelect>
        <span>una ventaja competitiva sobre</span>
        <InlineSelect
          id="reference-company"
          ariaLabel="Compañía de referencia"
          value={referenceCompanyId}
          disabled={isDisabled}
          selectedLabel={referenceCompanyName}
          accentColor={getCompanyAccentColor(referenceCompanyName)}
          onChange={onReferenceCompanyChange}
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </InlineSelect>
        <span>en</span>
        <span className="inline-flex min-w-0 max-w-full items-center gap-x-2">
          <InlineSelect
            id="metric"
            ariaLabel="Métrica"
            value={metricId}
            disabled={isDisabled}
            selectedLabel={metricDisplayName}
            onChange={onMetricChange}
          >
            {metrics.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {getMetricDisplayName(metric)}
              </option>
            ))}
          </InlineSelect>
          <span>?</span>
        </span>
      </div>
    </div>
  )
}

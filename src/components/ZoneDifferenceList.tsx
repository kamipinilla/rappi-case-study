import { useEffect, useState } from 'react'

import type { Zone } from '../data/MetricAnalyzer'

type ZoneDifferenceListProps = {
  zones: Zone[]
  referenceCompanyName: string
  comparisonCompanyName: string
  metricUnitLabel: string
  selectedZoneId: string | null
  onZoneSelect: (zoneId: string) => void
}

const differenceFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const MAX_VISIBLE_ZONES = 10

export function ZoneDifferenceList({
  zones,
  referenceCompanyName,
  comparisonCompanyName,
  metricUnitLabel,
  selectedZoneId,
  onZoneSelect,
}: ZoneDifferenceListProps) {
  const [isSelectionLocked, setIsSelectionLocked] = useState(true)
  const [hasCursorLeftRowsSinceLock, setHasCursorLeftRowsSinceLock] =
    useState(true)
  const [isCursorOverRows, setIsCursorOverRows] = useState(false)
  const visibleZones = zones.slice(0, MAX_VISIBLE_ZONES)
  const differenceColumnLabel = metricUnitLabel
    ? `Diferencia (${metricUnitLabel})`
    : 'Diferencia'

  useEffect(() => {
    setIsSelectionLocked(true)
    setHasCursorLeftRowsSinceLock(true)
    setIsCursorOverRows(false)
  }, [zones])

  const handleZoneHover = (zoneId: string) => {
    setIsCursorOverRows(true)

    if (isSelectionLocked) {
      if (zoneId === selectedZoneId || !hasCursorLeftRowsSinceLock) {
        return
      }

      setIsSelectionLocked(false)
    }

    onZoneSelect(zoneId)
  }

  const handleRowsLeave = () => {
    setHasCursorLeftRowsSinceLock(true)
    setIsCursorOverRows(false)

    if (!isSelectionLocked && visibleZones[0]) {
      onZoneSelect(visibleZones[0].id)
    }
  }

  const handleZoneClick = (zoneId: string) => {
    onZoneSelect(zoneId)
    setIsSelectionLocked(true)
    setHasCursorLeftRowsSinceLock(false)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" className="py-2.5 pl-4 pr-3">
                Zona
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                {differenceColumnLabel}
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                {comparisonCompanyName}
              </th>
              <th scope="col" className="py-2.5 pl-3 pr-4 text-right">
                {referenceCompanyName}
              </th>
            </tr>
          </thead>
          <tbody
            onMouseLeave={handleRowsLeave}
            className="divide-y divide-slate-200"
          >
            {visibleZones.map((zone) => {
              const differencePrefix =
                zone.comparisonData.value >= zone.referenceData.value
                  ? '+'
                  : '-'
              const isSelected = zone.id === selectedZoneId
              const shouldShowSelectionBackground =
                isSelected && (isSelectionLocked || isCursorOverRows)
              const rowBackgroundClass =
                shouldShowSelectionBackground && isSelectionLocked
                  ? 'bg-slate-200 hover:bg-slate-200'
                  : shouldShowSelectionBackground
                    ? 'bg-slate-50 hover:bg-slate-100'
                    : 'bg-white hover:bg-slate-50'

              return (
                <tr
                  key={zone.id}
                  onMouseEnter={() => handleZoneHover(zone.id)}
                  onClick={() => handleZoneClick(zone.id)}
                  className={`cursor-pointer transition ${rowBackgroundClass}`}
                >
                  <td
                    className={`py-2.5 pl-4 pr-3 ${
                      zone.isPrioritized
                        ? 'font-bold text-[#ff441f]'
                        : 'font-medium text-slate-800'
                    }`}
                  >
                    {zone.name}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-950">
                    {differencePrefix}
                    {differenceFormatter.format(zone.difference)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-700">
                    {differenceFormatter.format(zone.comparisonData.value)}
                  </td>
                  <td className="py-2.5 pl-3 pr-4 text-right text-slate-700">
                    {differenceFormatter.format(zone.referenceData.value)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

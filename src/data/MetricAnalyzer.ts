import type {
  Id,
  MetricsProvider,
  Zone as MetricsProviderZone,
} from './MetricsProvider'

export type MetricType = 'higher_is_better' | 'lower_is_better'

export type ComparisonType = 'higher_than_reference' | 'lower_than_reference'

export type Measurement = {
  value: number
  weeksAgo: number
}

export type MetricData = {
  value: number
  measurements: Measurement[]
}

export type Zone = {
  id: Id
  name: string
  isPrioritized: boolean
  referenceData: MetricData
  comparisonData: MetricData
  difference: number
}

export type Response = {
  comparisonType: ComparisonType
  zones: Zone[]
}

export interface MetricAnalyzerRepo {
  getMetricType(metricId: Id): Promise<MetricType>
  getZones(zoneIds: Id[]): Promise<Map<Id, ZoneInfo>>
}

export type ZoneInfo = {
  name: string
  isPrioritized: boolean
}

type ComparableZone = {
  id: Id
  referenceData: MetricData
  comparisonData: MetricData
  rawDifference: number
}

const MINIMUM_DIFFERENCE_MAGNITUDE = 0.005

export class MetricAnalyzer {
  constructor(
    private readonly metricsProvider: MetricsProvider,
    private readonly repo: MetricAnalyzerRepo,
  ) {}

  async analyze(
    referenceCompanyId: Id,
    comparisonCompanyId: Id,
    metricId: Id,
  ): Promise<Response> {
    const [metricType, referenceZones, comparisonZones] = await Promise.all([
      this.repo.getMetricType(metricId),
      this.metricsProvider.getMeasurementsByZone(referenceCompanyId, metricId),
      this.metricsProvider.getMeasurementsByZone(comparisonCompanyId, metricId),
    ])

    const comparableZones = this.getComparableZones(
      referenceZones,
      comparisonZones,
    )
      .filter((zone) => this.shouldIncludeZone(zone, metricType))
      .sort((first, second) =>
        this.compareZonesByDifference(first, second, metricType),
      )

    const zoneInfoById = await this.repo.getZones(
      comparableZones.map((zone) => zone.id),
    )

    return {
      comparisonType: this.getComparisonType(metricType),
      zones: comparableZones.map((zone) => this.mapZone(zone, zoneInfoById)),
    }
  }

  private getComparableZones(
    referenceZones: MetricsProviderZone[],
    comparisonZones: MetricsProviderZone[],
  ): ComparableZone[] {
    const referenceZonesById = new Map(
      referenceZones.map((zone) => [zone.id, zone]),
    )

    return comparisonZones.flatMap((comparisonZone) => {
      const referenceZone = referenceZonesById.get(comparisonZone.id)

      if (!referenceZone) {
        return []
      }

      return [
        {
          id: comparisonZone.id,
          referenceData: this.mapMetricData(referenceZone),
          comparisonData: this.mapMetricData(comparisonZone),
          rawDifference: comparisonZone.average - referenceZone.average,
        },
      ]
    })
  }

  private mapMetricData(zone: MetricsProviderZone): MetricData {
    return {
      value: zone.average,
      measurements: zone.measurements.map((measurement) => ({
        value: measurement.value,
        weeksAgo: measurement.weeksAgo,
      })),
    }
  }

  private shouldIncludeZone(
    zone: ComparableZone,
    metricType: MetricType,
  ): boolean {
    if (Math.abs(zone.rawDifference) < MINIMUM_DIFFERENCE_MAGNITUDE) {
      return false
    }

    if (metricType === 'higher_is_better') {
      return zone.rawDifference > 0
    } else {
      return zone.rawDifference < 0
    }
  }

  private compareZonesByDifference(
    first: ComparableZone,
    second: ComparableZone,
    metricType: MetricType,
  ): number {
    if (metricType === 'higher_is_better') {
      return second.rawDifference - first.rawDifference
    } else {
      return first.rawDifference - second.rawDifference
    }
  }

  private getComparisonType(metricType: MetricType): ComparisonType {
    if (metricType === 'higher_is_better') {
      return 'higher_than_reference'
    } else {
      return 'lower_than_reference'
    }
  }

  private mapZone(zone: ComparableZone, zoneInfoById: Map<Id, ZoneInfo>): Zone {
    const zoneInfo = zoneInfoById.get(zone.id)

    if (zoneInfo === undefined) {
      throw new Error(`Missing zone name for zone ${zone.id}.`)
    }

    return {
      id: zone.id,
      name: zoneInfo.name,
      isPrioritized: zoneInfo.isPrioritized,
      referenceData: zone.referenceData,
      comparisonData: zone.comparisonData,
      difference: Math.abs(zone.rawDifference),
    }
  }
}

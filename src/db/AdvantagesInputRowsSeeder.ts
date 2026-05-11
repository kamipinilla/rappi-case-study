import type { Database, SqlValue } from 'sql.js'

import type { MetricType } from '../data/MetricAnalyzer'
import type {
  AdvantagesInputRow,
  AdvantagesInputRowsProvider,
} from './AdvantagesInputRowsProvider'
import type { AverageTargetValuesGenerator } from './AverageTargetValuesGenerator'

type MetricReference = {
  id: string
  type: MetricType
}

export class AdvantagesInputRowsSeeder {
  private readonly generatedAverageEpsilon = 0.0001

  private readonly targetMeasurementsCount = 9

  constructor(
    private readonly providers: AdvantagesInputRowsProvider[],
    private readonly averageTargetValuesGenerator: AverageTargetValuesGenerator,
  ) {}

  seed(database: Database) {
    const rows = this.providers.flatMap((provider) => provider.getRows())

    database.run('BEGIN')

    try {
      for (const row of rows) {
        this.seedRow(database, row)
      }

      database.run('COMMIT')
    } catch (error) {
      database.run('ROLLBACK')
      throw error
    }
  }

  private seedRow(database: Database, row: AdvantagesInputRow) {
    const competitorId = this.getRequiredCompanyId(database, row.competitor)
    const rappiId = this.getRequiredCompanyId(database, 'Rappi')
    const zoneId = this.getRequiredUniqueZoneId(database, row.zone)
    const metric = this.getRequiredMetric(database, row.metric)
    const competitorAverage = this.getRequiredCompetitorAverage(database, {
      companyId: competitorId,
      metricId: metric.id,
      zoneId,
    })
    const rappiAverage = this.computeRappiValue(
      competitorAverage,
      row.advantage,
      metric.type,
    )
    const rappiValues = this.getRappiTargetValues(rappiAverage)

    this.ensureRappiMeasurementDoesNotExist(database, {
      companyId: rappiId,
      metricId: metric.id,
      zoneId,
    })

    for (const [weeksAgo, rappiValue] of rappiValues.entries()) {
      database.run(
        'INSERT INTO metric_measurement (id, value, weeks_ago, zone_id, metric_id, company_id) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), rappiValue, weeksAgo, zoneId, metric.id, rappiId],
      )
    }
  }

  private getRequiredCompanyId(database: Database, name: string): string {
    const id = this.getFirstId(
      database,
      'SELECT id FROM company WHERE name = ? LIMIT 1',
      [name],
    )

    if (id === null) {
      throw new Error(`Company "${name}" not found.`)
    }

    return id
  }

  private getRequiredUniqueZoneId(database: Database, name: string): string {
    const result = database.exec('SELECT id FROM zone WHERE name = ?', [name])
    const values = result[0]?.values ?? []

    if (values.length === 0) {
      throw new Error(`Zone "${name}" not found.`)
    }

    if (values.length > 1) {
      throw new Error(`Zone "${name}" is ambiguous.`)
    }

    return String(values[0][0])
  }

  private getRequiredMetric(database: Database, name: string): MetricReference {
    const result = database.exec(
      `
        SELECT metric.id, metric_type.code
        FROM metric
        INNER JOIN metric_type ON metric_type.id = metric.type_id
        WHERE metric.name = ?
        LIMIT 1
      `,
      [name],
    )
    const row = result[0]?.values[0]

    if (row === undefined) {
      throw new Error(`Metric "${name}" not found.`)
    }

    const metricType = String(row[1])

    if (metricType !== 'higher_is_better' && metricType !== 'lower_is_better') {
      throw new Error(`Invalid metric type "${metricType}" for metric "${name}".`)
    }

    return {
      id: String(row[0]),
      type: metricType,
    }
  }

  private getRequiredCompetitorAverage(
    database: Database,
    ids: {
      companyId: string
      metricId: string
      zoneId: string
    },
  ): number {
    const result = database.exec(
      `
        SELECT AVG(value)
        FROM metric_measurement
        WHERE company_id = ?
          AND metric_id = ?
          AND zone_id = ?
      `,
      [ids.companyId, ids.metricId, ids.zoneId],
    )
    const value = result[0]?.values[0]?.[0]

    if (value === undefined || value === null) {
      throw new Error('Competitor measurements not found.')
    }

    const average = Number(value)

    if (!Number.isFinite(average)) {
      throw new Error('Competitor average must be numeric.')
    }

    return average
  }

  private computeRappiValue(
    competitorAverage: number,
    advantage: number,
    metricType: MetricType,
  ): number {
    const rappiValue =
      metricType === 'higher_is_better'
        ? competitorAverage / (1 + advantage)
        : competitorAverage / (1 - advantage)

    if (!Number.isFinite(rappiValue)) {
      throw new Error('Computed Rappi measurement must be finite.')
    }

    return rappiValue
  }

  private getRappiTargetValues(rappiAverage: number): number[] {
    const targetValues = this.averageTargetValuesGenerator.generate(
      rappiAverage,
      this.targetMeasurementsCount,
    )

    if (targetValues.length !== this.targetMeasurementsCount) {
      throw new Error('Generated Rappi measurements count is invalid.')
    }

    for (const targetValue of targetValues) {
      if (!Number.isFinite(targetValue)) {
        throw new Error('Generated Rappi measurement must be finite.')
      }
    }

    const generatedAverage =
      targetValues.reduce((sum, targetValue) => sum + targetValue, 0) /
      targetValues.length

    if (
      Math.abs(generatedAverage - rappiAverage) >
      this.generatedAverageEpsilon
    ) {
      throw new Error('Generated Rappi measurements average is invalid.')
    }

    return targetValues
  }

  private ensureRappiMeasurementDoesNotExist(
    database: Database,
    ids: {
      companyId: string
      metricId: string
      zoneId: string
    },
  ) {
    const existingId = this.getFirstId(
      database,
      `
        SELECT id
        FROM metric_measurement
        WHERE company_id = ?
          AND metric_id = ?
          AND zone_id = ?
          AND weeks_ago >= 0
          AND weeks_ago < ?
        LIMIT 1
      `,
      [
        ids.companyId,
        ids.metricId,
        ids.zoneId,
        this.targetMeasurementsCount,
      ],
    )

    if (existingId !== null) {
      throw new Error('Rappi measurement already exists.')
    }
  }

  private getFirstId(
    database: Database,
    statement: string,
    params: SqlValue[],
  ): string | null {
    const result = database.exec(statement, params)
    const id = result[0]?.values[0]?.[0]

    if (id === undefined || id === null) {
      return null
    }

    return String(id)
  }
}

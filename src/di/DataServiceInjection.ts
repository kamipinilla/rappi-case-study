import { SqlCompanyRepo } from '../data/CompanyRepo'
import { MainDataService, type DataService } from '../data/DataService'
import { MetricAnalyzer } from '../data/MetricAnalyzer'
import { SqlMetricAnalyzerRepo } from '../data/MetricAnalyzerRepo'
import { SqlMetricRepo } from '../data/MetricRepo'
import { MetricsProvider } from '../data/MetricsProvider'
import { SqlMetricsProviderRepo } from '../data/MetricsProviderRepo'
import {
  SeededRandomNumberGenerator,
  SymmetricRandomAverageTargetValuesGenerator,
} from '../db/AverageTargetValuesGenerator'
import { TsvParserAdvantagesInputRowsProvider } from '../db/AdvantagesInputRowsProvider'
import { AdvantagesInputRowsSeeder } from '../db/AdvantagesInputRowsSeeder'
import { RappiCompanySeeder } from '../db/RappiCompanySeeder'
import { Schema } from '../db/Schema'
import { SqlJsDatabaseConnection } from '../db/SqlJsDatabaseConnection'
import { TsvParserStandardInputRowsProvider } from '../db/StandardInputRowsProvider'
import { StandardInputRowsSeeder } from '../db/StandardInputRowsSeeder'
import { TsvFileReader } from '../db/TsvFileReader'
import { PapaParseTsvParser } from '../utils/TsvParser'

const schema = new Schema()
const tsvFileReader = new TsvFileReader()
const tsvParser = new PapaParseTsvParser()
const standardInputRowsProvider = new TsvParserStandardInputRowsProvider(
  tsvFileReader.read('rows'),
  tsvParser,
)
const standardInputRowsSeeder = new StandardInputRowsSeeder([
  standardInputRowsProvider,
])
const advantagesInputRowsProvider = new TsvParserAdvantagesInputRowsProvider(
  tsvFileReader.read('advantages'),
  tsvParser,
)
const randomNumberGenerator = new SeededRandomNumberGenerator(20260510)
const averageTargetValuesGenerator =
  new SymmetricRandomAverageTargetValuesGenerator(randomNumberGenerator)
const advantagesInputRowsSeeder = new AdvantagesInputRowsSeeder(
  [advantagesInputRowsProvider],
  averageTargetValuesGenerator,
)
const rappiCompanySeeder = new RappiCompanySeeder()
const databaseConnection = new SqlJsDatabaseConnection(
  schema,
  rappiCompanySeeder,
  standardInputRowsSeeder,
  advantagesInputRowsSeeder,
)

const metricsProviderRepo = new SqlMetricsProviderRepo(databaseConnection)
const metricsProvider = new MetricsProvider(metricsProviderRepo)

const metricAnalyzerRepo = new SqlMetricAnalyzerRepo(databaseConnection)
const metricAnalyzer = new MetricAnalyzer(metricsProvider, metricAnalyzerRepo)

const companyRepo = new SqlCompanyRepo(databaseConnection)
const metricRepo = new SqlMetricRepo(databaseConnection)

export const dataService: DataService = new MainDataService(
  metricAnalyzer,
  companyRepo,
  metricRepo,
)

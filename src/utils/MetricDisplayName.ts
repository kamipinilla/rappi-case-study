import type { Metric } from '../data/MetricRepo'

const metricDisplayNames: Record<string, string> = {
  'Avg Delivery Time (mins)': 'tiempo de entrega',
  'Customer Satisfaction Score': 'puntaje de satisfacción',
  'Delivery Fee (MXN)': 'tarifa de envío',
  'Restaurants SST > SS CVR': 'conversión en restaurantes',
  'Retail SST > SS CVR': 'conversión en retail',
  'Service Fee (%)': 'tarifa de servicio',
}

const metricUnitLabels: Record<string, string> = {
  'Avg Delivery Time (mins)': 'mins',
  'Customer Satisfaction Score': 'pts',
  'Delivery Fee (MXN)': 'MXN',
  'Restaurants SST > SS CVR': '%',
  'Retail SST > SS CVR': '%',
  'Service Fee (%)': '%',
}

export function getMetricDisplayName(metric: Metric): string {
  return metricDisplayNames[metric.name] ?? metric.name
}

export function getMetricDisplayNameByName(metricName: string): string {
  return metricDisplayNames[metricName] ?? metricName
}

export function getMetricUnitLabelByName(metricName: string): string {
  return metricUnitLabels[metricName] ?? ''
}

export function isSatisfactionMetric(metricName: string): boolean {
  return metricName === 'Customer Satisfaction Score'
}

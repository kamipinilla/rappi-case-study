import type { Metric } from '../data/MetricRepo'

const metricDisplayNames: Record<string, string> = {
  'Avg Delivery Time (mins)': 'tiempo de entrega',
  'Customer Satisfaction Score': 'puntaje de satisfacción',
  'Delivery Fee (MXN)': 'tarifa de envío',
  'Restaurants SST > SS CVR': 'conversión en restaurantes',
  'Retail SST > SS CVR': 'conversión en retail',
  'Service Fee (%)': 'tarifa de servicio',
}

export function getMetricDisplayName(metric: Metric): string {
  return metricDisplayNames[metric.name] ?? metric.name
}

export function getMetricDisplayNameByName(metricName: string): string {
  return metricDisplayNames[metricName] ?? metricName
}

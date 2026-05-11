export const DEFAULT_ACCENT_COLOR = '#94a3b8'

const COMPANY_ACCENT_COLORS = {
  didi: '#b77900',
  rappi: '#ff441f',
  uber: '#04914e',
} as const

export function getCompanyAccentColor(companyName: string): string {
  const normalizedCompanyName = companyName.toLowerCase()

  if (normalizedCompanyName.includes('uber')) {
    return COMPANY_ACCENT_COLORS.uber
  }

  if (normalizedCompanyName.includes('didi')) {
    return COMPANY_ACCENT_COLORS.didi
  }

  if (normalizedCompanyName.includes('rappi')) {
    return COMPANY_ACCENT_COLORS.rappi
  }

  return DEFAULT_ACCENT_COLOR
}

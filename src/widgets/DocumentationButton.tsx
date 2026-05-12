import { getCompanyAccentColor } from '../utils/CompanyAccentColor'

const RAPPI_ACCENT_COLOR = getCompanyAccentColor('Rappi')

export function DocumentationButton() {
  return (
    <a
      href="https://docs.rappi-case-study.com"
      target="_blank"
      rel="noreferrer"
      aria-label="Documentación"
      style={{
        borderColor: RAPPI_ACCENT_COLOR,
        boxShadow: `0 0 0 1px ${RAPPI_ACCENT_COLOR}`,
        color: RAPPI_ACCENT_COLOR,
      }}
      className="absolute bottom-5 right-5 top-5 inline-flex aspect-square cursor-pointer items-center justify-center rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-[#ff441f]/20"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
      >
        <path
          d="M6.75 3.75h6.5l4 4v12.5H6.75V3.75Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M13.25 3.75v4h4M9 12.25h6M9 15.25h6M9 18.25h3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}

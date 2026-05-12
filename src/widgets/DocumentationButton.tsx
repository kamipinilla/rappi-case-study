export function DocumentationButton() {
  return (
    <button
      type="button"
      aria-label="Documentación"
      title="Documentación"
      className="absolute bottom-5 right-5 top-5 inline-flex aspect-square items-center justify-center rounded-full border border-[#ff441f] bg-white text-[#ff441f] shadow-sm transition hover:bg-[#fff2ee] focus:outline-none focus:ring-2 focus:ring-[#ff441f]/20"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
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
    </button>
  )
}

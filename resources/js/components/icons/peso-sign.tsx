// components/icons/peso-sign.tsx
export const PesoSign = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 6h9a4 4 0 0 1 0 8H5" />
        <line x1="5" y1="10" x2="14" y2="10" />
        <line x1="5" y1="14" x2="10" y2="14" />
        <line x1="5" y1="6" x2="5" y2="20" />
    </svg>
);

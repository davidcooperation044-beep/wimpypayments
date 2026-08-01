export default function SealBadge() {
  return (
    <span className="seal-badge" aria-label="Verified">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#C9A227" />
        <circle cx="12" cy="12" r="9" fill="none" stroke="#a0801a" strokeWidth="1.5" />
        <path
          d="M8.2 12.2l2.4 2.4 5.2-5.2"
          fill="none"
          stroke="#0F1B33"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

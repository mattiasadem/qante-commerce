export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="6" fill="#d8c7a6" />
      <circle cx="23" cy="23" r="5.5" fill="#0b0b0b" />
    </svg>
  );
}

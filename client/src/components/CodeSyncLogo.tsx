'use client';

interface CodeSyncLogoProps {
  size?: number;
  className?: string;
}

export default function CodeSyncLogo({ size = 28, className = '' }: CodeSyncLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563eb' }} />
          <stop offset="100%" style={{ stopColor: '#6366f1' }} />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="url(#logoBg)" />
      {/* Code brackets < /> */}
      <path d="M18 24L10 32L18 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 24L54 32L46 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sync arrows */}
      <path d="M28 22L36 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 19L37 22L34 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 42L28 42" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 39L27 42L30 45" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Slash */}
      <path d="M35 28L29 36" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

import React from 'react';

export const BrandLogo = ({ size = 42 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Outer subtle shadow/border circle */}
      <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      
      {/* Globe grid watermark in light slate blue */}
      <circle cx="62" cy="62" r="28" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.65" />
      <ellipse cx="62" cy="62" rx="28" ry="12" fill="none" stroke="#93c5fd" strokeWidth="1.2" opacity="0.65" />
      <ellipse cx="62" cy="62" rx="12" ry="28" fill="none" stroke="#93c5fd" strokeWidth="1.2" opacity="0.65" />
      <line x1="34" y1="62" x2="90" y2="62" stroke="#93c5fd" strokeWidth="1.2" opacity="0.65" />
      <line x1="62" y1="34" x2="62" y2="90" stroke="#93c5fd" strokeWidth="1.2" opacity="0.65" />

      {/* Bold Dark Navy Monogram Letter 'D' */}
      <path
        d="M20 18 H38 C54 18 64 28 64 44 C64 60 54 70 38 70 H20 V18 Z M28 26 V62 H38 C48 62 55 55 55 44 C55 33 48 26 38 26 H28 Z"
        fill="#162032"
      />

      {/* Dynamic Golden Curved Swoosh / 'S' / 'K' flourish */}
      <path
        d="M12 68 C12 76 22 84 36 80 C48 76 56 64 66 48 C74 36 82 24 72 20 C64 16 52 30 42 46 C34 58 22 70 12 68 Z"
        fill="url(#goldGradient)"
      />
      <path
        d="M38 52 L58 26 L66 32 L46 58 Z"
        fill="#b38a1f"
        opacity="0.85"
      />

      <defs>
        <linearGradient id="goldGradient" x1="12" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e6cb7e" />
          <stop offset="45%" stopColor="#c59b27" />
          <stop offset="100%" stopColor="#8c680f" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default BrandLogo;

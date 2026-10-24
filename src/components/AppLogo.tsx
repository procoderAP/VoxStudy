import React from 'react';

export type LogoVariant = 'minimalist-vox';

interface AppLogoProps {
  className?: string;
  size?: number;
  variant?: LogoVariant;
  color?: string;
  accentColor?: string;
}

/**
 * VoxStudy Official Finalized Brand Emblem
 * Clean geometric acoustic sound waves converging into the letter V.
 * Permanent, static, and uncustomizable.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
  accentColor = 'var(--theme-accent)',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VoxStudy Emblem"
    >
      <path
        d="M4 4L12 20L20 4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8L12 16L16 8"
        stroke={accentColor || color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="1.5" fill={accentColor || color} />
    </svg>
  );
};

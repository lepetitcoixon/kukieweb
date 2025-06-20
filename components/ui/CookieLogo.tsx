
import React from 'react';

interface CookieLogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  cookieColor?: string;
  chipColor?: string;
  biteColor?: string;
}

export const CookieLogo: React.FC<CookieLogoProps> = ({
  className = '',
  width = "100",
  height = "100",
  cookieColor = "currentColor", // Allows control via text-kukie-yellow
  chipColor = "rgba(0,0,0,0.2)",
  biteColor = "var(--logo-bite-color, #5D544C)" // Default to kukie-brown, or CSS variable
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ '--logo-bite-color': biteColor } as React.CSSProperties} // For dynamic bite color matching background
    >
      <circle cx="50" cy="50" r="45" fill={cookieColor} />
      {/* Bite */}
      <path 
        d="M85,30 A30,30 0 0,0 65,12 A25,25 0 0,1 88,20 A35,35 0 0,0 85,30 Z" 
        fill="var(--logo-bite-color)" 
      />
       <path d="M93 45 A 20 20 0 0 0 70 30 L 70 45 Z" fill="var(--logo-bite-color)" />


      {/* Chocolate Chips */}
      <circle cx="50" cy="30" r="5" fill={chipColor} />
      <circle cx="35" cy="45" r="6" fill={chipColor} />
      <circle cx="65" cy="50" r="4" fill={chipColor} />
      <circle cx="40" cy="65" r="5" fill={chipColor} />
      <circle cx="60" cy="70" r="6" fill={chipColor} />
      <circle cx="75" cy="35" r="3" fill={chipColor} />
    </svg>
  );
};

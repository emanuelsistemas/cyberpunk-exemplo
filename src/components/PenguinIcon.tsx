import React from 'react';

export function PenguinIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Corpo principal (preto) */}
      <path
        d="M12 2.5C8.5 2.5 6 5 6 8c0 2 1 3.5 2 4.5v7c0 1 .5 1.5 1.5 1.5h5c1 0 1.5-.5 1.5-1.5v-7c1-1 2-2.5 2-4.5 0-3-2.5-5.5-6-5.5z"
        fill="currentColor"
      />

      {/* Barriga (branca) */}
      <path
        d="M9.5 8.5C9.5 6 10.5 5 12 5s2.5 1 2.5 3.5S13.5 13 12 13s-2.5-2-2.5-4.5z"
        fill="none"
        strokeWidth="1.5"
      />

      {/* Asas */}
      <path
        d="M7 8.5C5.5 9.5 5 11 5 12.5c0 1.5.5 3 2 4"
        strokeWidth="1.5"
      />
      <path
        d="M17 8.5c1.5 1 2 2.5 2 4 0 1.5-.5 3-2 4"
        strokeWidth="1.5"
      />

      {/* Olhos */}
      <circle cx="10.5" cy="7.5" r="0.8" fill="none" strokeWidth="1" />
      <circle cx="13.5" cy="7.5" r="0.8" fill="none" strokeWidth="1" />
      <circle cx="10.2" cy="7.2" r="0.3" fill="currentColor" />
      <circle cx="13.2" cy="7.2" r="0.3" fill="currentColor" />

      {/* Bico */}
      <path
        d="M11 8.5c.5.5 1.5.5 2 0"
        fill="none"
        strokeWidth="1"
      />
      <path
        d="M11.2 9.2c.4.2.8.2 1.2 0"
        fill="none"
        strokeWidth="1"
      />

      {/* Pés */}
      <path
        d="M9.5 21c-.5-.5-1-1-1-1.5 0-.5.5-1 1-1s1 .5 1 1-.5 1-1 1.5z"
        strokeWidth="1"
      />
      <path
        d="M14.5 21c.5-.5 1-1 1-1.5 0-.5-.5-1-1-1s-1 .5-1 1 .5 1 1 1.5z"
        strokeWidth="1"
      />

      {/* Detalhes cyberpunk */}
      <path
        d="M8 6.5l-.5-.5M16 6.5l.5-.5"
        strokeWidth=".5"
      />
      <path
        d="M12 3.5v-.5M12 14.5v-.5"
        strokeWidth=".5"
      />
    </svg>
  );
}
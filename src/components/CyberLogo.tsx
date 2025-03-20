import React from 'react';

export function CyberLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Matrix-style grid background */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className="border-[0.5px] border-green-500"
            style={{
              animation: `pulse ${(i % 3) + 1}s infinite`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Main hexagon */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
      >
        {/* Outer hexagon */}
        <polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          className="fill-black stroke-green-500"
          strokeWidth="1"
        />

        {/* Inner hexagon */}
        <polygon
          points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
          className="fill-transparent stroke-green-500"
          strokeWidth="0.5"
        />

        {/* Circuit lines */}
        <path
          d="M20,50 H40 M60,50 H80 M50,15 V35 M50,65 V85"
          className="stroke-green-500"
          strokeWidth="0.5"
        />

        {/* Glowing dots */}
        <circle cx="40" cy="50" r="2" className="fill-green-500 animate-pulse" />
        <circle cx="60" cy="50" r="2" className="fill-green-500 animate-pulse" />
        <circle cx="50" cy="35" r="2" className="fill-green-500 animate-pulse" />
        <circle cx="50" cy="65" r="2" className="fill-green-500 animate-pulse" />

        {/* Central circuit pattern */}
        <path
          d="M45,45 h10 v10 h-10 z"
          className="fill-none stroke-green-500"
          strokeWidth="0.5"
        />
        <circle
          cx="50"
          cy="50"
          r="8"
          className="fill-none stroke-green-500 animate-pulse"
          strokeWidth="0.5"
        />

        {/* Digital artifacts */}
        <text
          x="30"
          y="40"
          className="fill-green-500 text-[4px] font-mono animate-pulse"
          style={{ animationDelay: '0.5s' }}
        >
          01
        </text>
        <text
          x="65"
          y="60"
          className="fill-green-500 text-[4px] font-mono animate-pulse"
          style={{ animationDelay: '1s' }}
        >
          10
        </text>
      </svg>

      {/* Glitch effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black opacity-20" />
    </div>
  );
}
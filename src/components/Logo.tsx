import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark-only' | 'horizontal';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  variant = 'horizontal',
}) => {
  const iconSizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  // Authentic hand-crafted vector emblem with transparent background (no white box!)
  const LogoMark = (
    <svg
      viewBox="0 0 200 200"
      className={`${iconSizeMap[size]} shrink-0 transition-transform duration-300 hover:rotate-2`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circular badge frame with warm cream fill */}
      <circle
        cx="100"
        cy="96"
        r="78"
        stroke="#70412E"
        strokeWidth="4"
        strokeDasharray="490"
        strokeLinecap="round"
        fill="#FFFAF1"
      />

      {/* Decorative leaf top left */}
      <path
        d="M 54 62 C 50 56, 58 48, 64 54 C 64 62, 58 64, 54 62 Z"
        fill="#78804B"
        stroke="#70412E"
        strokeWidth="2.5"
      />
      <line x1="56" y1="59" x2="61" y2="55" stroke="#FFFAF1" strokeWidth="1.5" strokeLinecap="round" />

      {/* Decorative leaf top right */}
      <path
        d="M 124 54 C 120 46, 130 42, 134 50 C 134 58, 128 58, 124 54 Z"
        fill="#78804B"
        stroke="#70412E"
        strokeWidth="2.5"
      />
      <line x1="126" y1="52" x2="131" y2="48" stroke="#FFFAF1" strokeWidth="1.5" strokeLinecap="round" />

      {/* Steam rising in the center */}
      <path
        d="M 98 62 C 95 50, 106 40, 99 26 C 96 20, 102 18, 104 22 C 108 32, 98 42, 103 52 C 105 56, 102 60, 98 62 Z"
        fill="#C58B55"
        opacity="0.85"
      />
      <path
        d="M 112 56 C 110 46, 118 42, 114 32"
        stroke="#C58B55"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* DRINK CUP (Left) */}
      {/* Cup handle */}
      <path
        d="M 64 78 C 50 78, 50 102, 64 104"
        stroke="#70412E"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Straw sticking out */}
      <path
        d="M 78 72 L 68 50 L 58 46"
        stroke="#70412E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 78 72 L 68 50 L 58 46"
        stroke="#FFFAF1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Cup body */}
      <path
        d="M 64 74 L 102 74 C 102 96, 98 114, 83 114 C 68 114, 64 96, 64 74 Z"
        fill="#F5E6C8"
        stroke="#70412E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Cup liquid surface */}
      <ellipse cx="83" cy="76" rx="16" ry="3" fill="#70412E" />

      {/* Leaf pattern on cup belly */}
      <path
        d="M 83 88 C 80 82, 86 82, 83 88 Z"
        fill="#78804B"
        stroke="#70412E"
        strokeWidth="1.5"
      />
      <path
        d="M 78 92 C 73 88, 77 84, 82 89"
        fill="#78804B"
        stroke="#70412E"
        strokeWidth="1.5"
      />
      <path
        d="M 88 92 C 93 88, 89 84, 84 89"
        fill="#78804B"
        stroke="#70412E"
        strokeWidth="1.5"
      />
      {/* Cup ornamental swirl */}
      <path
        d="M 72 103 C 78 98, 88 98, 94 103"
        stroke="#70412E"
        strokeWidth="2"
        fill="none"
      />

      {/* MACARONI BOWL (Right) */}
      {/* Chopsticks sticking out */}
      <line x1="130" y1="78" x2="148" y2="40" stroke="#70412E" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="138" y1="78" x2="158" y2="46" stroke="#70412E" strokeWidth="4.5" strokeLinecap="round" />

      {/* Macaroni bowl body */}
      <path
        d="M 102 82 C 102 108, 142 108, 144 82 Z"
        fill="#F5E6C8"
        stroke="#70412E"
        strokeWidth="4"
      />
      {/* Bowl base */}
      <rect x="115" y="106" width="16" height="5" rx="2.5" fill="#70412E" />

      {/* Curved elbow macaroni noodles inside and above bowl */}
      <path
        d="M 112 76 C 110 70, 118 66, 124 72 C 122 75, 118 73, 115 76 Z"
        fill="#C58B55"
        stroke="#70412E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 124 70 C 128 64, 136 67, 136 74 C 132 75, 131 71, 127 72 Z"
        fill="#C58B55"
        stroke="#70412E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 106 82 C 108 76, 116 78, 116 84 C 112 85, 110 82, 108 84 Z"
        fill="#C58B55"
        stroke="#70412E"
        strokeWidth="2.5"
      />
      <path
        d="M 128 80 C 132 76, 140 79, 138 86 C 135 86, 134 82, 130 83 Z"
        fill="#C58B55"
        stroke="#70412E"
        strokeWidth="2.5"
      />

      {/* Cute face expressions on border */}
      <path d="M 52 108 L 56 111 L 52 114" stroke="#70412E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 58 112 C 58 118, 64 118, 64 112 Z" fill="#C58B55" stroke="#70412E" strokeWidth="2" />
      <path d="M 138 111 C 143 115, 149 113, 152 109" stroke="#70412E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="152" cy="107" r="1.5" fill="#70412E" />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center shrink-0 ${className}`}>{LogoMark}</div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {LogoMark}
        {showText && (
          <div className="mt-3 flex flex-col items-center">
            <span className="font-heading font-black tracking-tight text-[#70412E] text-2xl sm:text-3xl leading-tight">
              SERUPUT &amp; KUNYAH
            </span>
            <span className="font-heading text-xs font-bold text-[#806B58] tracking-wider uppercase mt-1">
              Seruput Segar, Kunyah Lezat
            </span>
          </div>
        )}
      </div>
    );
  }

  // Horizontal variant (optimized for Navbar & Footer - airy & clean)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      {LogoMark}
      {showText && (
        <div className="flex flex-col">
          <span className="font-heading font-black tracking-tight text-[#70412E] text-lg sm:text-xl leading-none whitespace-nowrap">
            SERUPUT &amp; KUNYAH
          </span>
          <span className="hidden xl:block text-[11px] font-semibold text-[#806B58] tracking-wide mt-1 whitespace-nowrap">
            Seruput Segar, Kunyah Lezat
          </span>
        </div>
      )}
    </div>
  );
};

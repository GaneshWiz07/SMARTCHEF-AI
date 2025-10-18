// Inline SVG logo component matching the chef-icon.svg design
function Logo({ className = "w-6 h-6", showGradient = true }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100"
      className={className}
    >
      {showGradient && (
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#16a34a', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      )}
      
      <circle cx="50" cy="50" r="48" fill={showGradient ? "url(#logoGradient)" : "#22c55e"} />
      
      {/* Chef Hat Icon */}
      <g transform="translate(50, 50)">
        {/* Hat top */}
        <path 
          d="M -15,-8 Q -15,-18 -8,-18 Q -8,-22 0,-22 Q 8,-22 8,-18 Q 15,-18 15,-8" 
          fill="white" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Hat base/band */}
        <rect 
          x="-18" 
          y="-8" 
          width="36" 
          height="16" 
          rx="2" 
          fill="white" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Hat pleats (details) */}
        <line x1="-10" y1="-8" x2="-10" y2="8" stroke="#22c55e" strokeWidth="1" opacity="0.3"/>
        <line x1="-3" y1="-8" x2="-3" y2="8" stroke="#22c55e" strokeWidth="1" opacity="0.3"/>
        <line x1="3" y1="-8" x2="3" y2="8" stroke="#22c55e" strokeWidth="1" opacity="0.3"/>
        <line x1="10" y1="-8" x2="10" y2="8" stroke="#22c55e" strokeWidth="1" opacity="0.3"/>
      </g>
    </svg>
  );
}

export default Logo;

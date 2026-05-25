export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
      {/* Heart pulse line */}
      <path d="M8 22l6-8 6 10 6-10 6 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Cross/plus symbolizing medical */}
      <circle cx="20" cy="16" r="3" fill="white" opacity="0.9" />
      <path d="M20 13v6M17 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function LogoWithText({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" }
  const iconSizes = { sm: "w-7 h-7", md: "w-8 h-8", lg: "w-10 h-10" }
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo className={iconSizes[size]} />
      <span className={`${sizes[size]} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
        SwasthyaSetu
      </span>
    </div>
  )
}

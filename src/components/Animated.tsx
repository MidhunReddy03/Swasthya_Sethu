'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

type AnimationType = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-right' | 'scale-bounce' | 'fade-down'
type SpringType = 'smooth' | 'bounce' | 'out'

const animClasses: Record<AnimationType, string> = {
  'fade-up': 'animate-fade-in-up',
  'fade-in': 'animate-fade-in',
  'scale-in': 'animate-scale-in',
  'slide-right': 'animate-slide-in-right',
  'scale-bounce': 'animate-scale-bounce',
  'fade-down': 'animate-fade-in-down',
}

export function Animated({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
  style = {},
}: {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  className?: string
  style?: React.CSSProperties
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const base = animClasses[animation]
  return (
    <div
      ref={ref}
      className={`${className} ${visible ? base : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  )
}

export function Stagger({
  children,
  baseDelay = 0,
  stepDelay = 80,
  animation = 'fade-up',
  className = '',
}: {
  children: ReactNode[]
  baseDelay?: number
  stepDelay?: number
  animation?: AnimationType
  className?: string
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Animated key={i} animation={animation} delay={baseDelay + i * stepDelay}>
          {child}
        </Animated>
      ))}
    </div>
  )
}

export function SpringScale({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`hover-scale ${className}`}>{children}</div>
}

export function HoverLift({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`hover-lift ${className}`}>{children}</div>
}

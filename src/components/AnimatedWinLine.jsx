import { useEffect, useState } from 'react'

const DURATION = 2500

export default function AnimatedWinLine({ from, to, size }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame
    const startedAt = performance.now()
    const draw = now => {
      const nextProgress = Math.min((now - startedAt) / DURATION, 1)
      setProgress(nextProgress)
      if (nextProgress < 1) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [from.x, from.y, to.x, to.y])

  const x2 = from.x + (to.x - from.x) * progress
  const y2 = from.y + (to.y - from.y) * progress

  return <svg className="win-line" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="none" aria-hidden="true">
    <line className="win-line-glow" x1={from.x} y1={from.y} x2={x2} y2={y2}/>
    <line className="win-line-stroke" x1={from.x} y1={from.y} x2={x2} y2={y2}/>
  </svg>
}

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [isZooming, setIsZooming] = useState(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const startTime = performance.now()
    const duration = 1400 // 1.4s responsive and smooth
    let isCancelled = false
    let animationFrameId
    let lastProgress = 0

    const update = (now) => {
      if (isCancelled) return

      const elapsed = now - startTime
      const current = Math.min(100, Math.floor((elapsed / duration) * 100))

      if (current !== lastProgress) {
        lastProgress = current
        setProgress(current)
      }

      if (current < 100) {
        animationFrameId = requestAnimationFrame(update)
      } else {
        setIsZooming(true)
        setTimeout(() => {
          if (!isCancelled && onCompleteRef.current) {
            onCompleteRef.current()
          }
        }, 650)
      }
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      isCancelled = true
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <motion.div
      key="atomic-preloader"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] text-white selection:bg-cyan-500/30 overflow-hidden select-none pointer-events-none"
    >
      {/* Ambient background soft glow */}
      <div className="absolute w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        {/* Atomic Graphic Container */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4 flex items-center justify-center">
          {/* Central Logo B - Zooms in smoothly towards camera */}
          <motion.div
            animate={
              isZooming
                ? {
                    scale: 24,
                    opacity: [1, 1, 0.8, 0],
                  }
                : {
                    scale: 1,
                    opacity: 1,
                  }
            }
            transition={
              isZooming
                ? {
                    duration: 0.65,
                    ease: [0.32, 0.72, 0, 1], // Smooth cinematic dive curve
                  }
                : { duration: 0.2 }
            }
            style={{ willChange: 'transform, opacity' }}
            className="relative flex items-center justify-center z-20"
          >
            {/* Glowing Diamond Core */}
            <div className="relative w-12 h-12 rotate-45 border-2 border-cyan-300 bg-slate-900 shadow-[0_0_20px_#22d3ee] flex items-center justify-center">
              <span className="-rotate-45 font-mono text-base font-black tracking-wider text-cyan-200">
                B
              </span>
            </div>
          </motion.div>

          {/* SVG Atomic Orbitals */}
          <motion.div
            animate={
              isZooming
                ? { scale: 1.8, opacity: 0 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.45, ease: 'easeIn' }}
            style={{ willChange: 'transform, opacity' }}
            className="absolute inset-0 w-full h-full"
          >
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full overflow-visible"
            >
              {/* Orbital Ring 1 (0 deg) */}
              <ellipse
                cx="100"
                cy="100"
                rx="82"
                ry="30"
                fill="none"
                stroke="rgba(34, 211, 238, 0.7)"
                strokeWidth="1.5"
              />

              {/* Orbital Ring 2 (60 deg) */}
              <g transform="rotate(60 100 100)">
                <ellipse
                  cx="100"
                  cy="100"
                  rx="82"
                  ry="30"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.7)"
                  strokeWidth="1.5"
                />
              </g>

              {/* Orbital Ring 3 (120 deg) */}
              <g transform="rotate(120 100 100)">
                <ellipse
                  cx="100"
                  cy="100"
                  rx="82"
                  ry="30"
                  fill="none"
                  stroke="rgba(129, 140, 248, 0.7)"
                  strokeWidth="1.5"
                />
              </g>
            </svg>

            {/* Orbiting Electrons (Native CSS hardware-accelerated continuous rotation) */}
            {/* Electron 1 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-full h-full flex items-center justify-center animate-[spin_2.2s_linear_infinite]"
                style={{ willChange: 'transform' }}
              >
                <div style={{ width: '164px', height: '60px' }} className="relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
                </div>
              </div>
            </div>

            {/* Electron 2 (Rotated 60deg) */}
            <div className="absolute inset-0 flex items-center justify-center rotate-[60deg]">
              <div
                className="w-full h-full flex items-center justify-center animate-[spin_2.7s_linear_infinite_reverse]"
                style={{ willChange: 'transform' }}
              >
                <div style={{ width: '164px', height: '60px' }} className="relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8]" />
                </div>
              </div>
            </div>

            {/* Electron 3 (Rotated 120deg) */}
            <div className="absolute inset-0 flex items-center justify-center rotate-[120deg]">
              <div
                className="w-full h-full flex items-center justify-center animate-[spin_2.4s_linear_infinite]"
                style={{ willChange: 'transform' }}
              >
                <div style={{ width: '164px', height: '60px' }} className="relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-200 shadow-[0_0_10px_#818cf8]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Text & Progress Section (Fades out when zooming in) */}
        <motion.div
          animate={
            isZooming
              ? { opacity: 0, y: 15 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center w-full"
        >
          {/* Brand Title */}
          <div className="text-center mb-4">
            <h1 className="text-xl sm:text-2xl font-black tracking-[0.3em] uppercase font-['Space_Grotesk'] text-slate-100">
              BAMBANG S
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-400/90 mt-0.5 font-mono">
              Digital Creator
            </p>
          </div>

          {/* Clean Progress Bar */}
          <div className="w-56 sm:w-64 flex flex-col items-center">
            <div className="w-full h-[2px] bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-full shadow-[0_0_8px_#22d3ee] transition-[width] duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status & Numeric Counter */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-widest text-slate-400">
              <span className="text-[10px] text-cyan-400 uppercase tracking-[0.2em]">
                {progress < 45
                  ? 'Orbital Sync'
                  : progress < 90
                    ? 'Charging Core'
                    : 'Entering Space'}
              </span>
              <span className="font-semibold text-cyan-300 tabular-nums">
                {progress}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

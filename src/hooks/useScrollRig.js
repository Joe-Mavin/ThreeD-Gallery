import { useMotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const clamp01 = (value) => Math.min(1, Math.max(0, value))

export function useScrollRig() {
  const [state, setState] = useState({ progress: 0, velocity: 0 })
  const motionProgress = useMotionValue(0)
  const latest = useRef({
    progress: 0,
    targetProgress: 0,
    velocity: 0,
    targetVelocity: 0,
    lastScrollY: 0,
    lastTime: performance.now(),
  })

  useEffect(() => {
    let frameId

    const measure = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const now = performance.now()
      const dt = Math.max(16, now - latest.current.lastTime)
      const scrollY = window.scrollY
      const rawVelocity = Math.abs(scrollY - latest.current.lastScrollY) / dt

      latest.current.targetProgress = clamp01(scrollY / scrollable)
      latest.current.targetVelocity = Math.min(1, rawVelocity / 2.8)
      latest.current.lastScrollY = scrollY
      latest.current.lastTime = now
    }

    const tick = () => {
      measure()
      const rig = latest.current
      rig.progress += (rig.targetProgress - rig.progress) * 0.085
      rig.velocity += (rig.targetVelocity - rig.velocity) * 0.12
      rig.targetVelocity *= 0.94

      motionProgress.set(rig.progress)
      setState({ progress: rig.progress, velocity: rig.velocity })
      frameId = requestAnimationFrame(tick)
    }

    measure()
    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [motionProgress])

  return { ...state, motionProgress }
}

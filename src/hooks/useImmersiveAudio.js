import { Howl } from 'howler'
import { useCallback, useEffect, useRef } from 'react'

function createTone({ frequency = 80, type = 'sine', gain = 0.04 }) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  const master = context.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  filter.type = 'lowpass'
  filter.frequency.value = 360
  master.gain.value = 0

  oscillator.connect(filter)
  filter.connect(master)
  master.connect(context.destination)
  oscillator.start()

  return { context, oscillator, filter, master, gain }
}

export function useImmersiveAudio(enabled, velocity) {
  const toneRef = useRef(null)
  const hoverRef = useRef(null)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    if (!hoverRef.current) {
      hoverRef.current = new Howl({
        src: [
          'data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAAAAAAD//wAAAP//AAD//wAA',
        ],
        volume: 0.045,
        rate: 1.8,
      })
    }
  }, [])

  useEffect(() => {
    const tone = toneRef.current
    if (!tone) return

    const target = enabled ? 0.028 + velocity * 0.05 : 0
    const rumble = 72 + velocity * 58
    const air = 260 + velocity * 940
    const now = tone.context.currentTime

    tone.master.gain.cancelScheduledValues(now)
    tone.master.gain.linearRampToValueAtTime(target, now + 0.25)
    tone.oscillator.frequency.linearRampToValueAtTime(rumble, now + 0.18)
    tone.filter.frequency.linearRampToValueAtTime(air, now + 0.22)
  }, [enabled, velocity])

  const start = useCallback(async () => {
    if (!toneRef.current) {
      toneRef.current = createTone({ frequency: 74, type: 'sine' })
    }

    if (toneRef.current.context.state === 'suspended') {
      await toneRef.current.context.resume()
    }
  }, [])

  const stop = useCallback(() => {
    const tone = toneRef.current
    if (!tone) return
    const now = tone.context.currentTime
    tone.master.gain.cancelScheduledValues(now)
    tone.master.gain.linearRampToValueAtTime(0, now + 0.4)
  }, [])

  const playHover = useCallback((mode = 'hover') => {
    if (!enabledRef.current || !hoverRef.current) return
    hoverRef.current.rate(mode === 'select' ? 1.15 : 1.9)
    hoverRef.current.volume(mode === 'select' ? 0.065 : 0.035)
    hoverRef.current.play()
  }, [])

  return { start, stop, playHover }
}

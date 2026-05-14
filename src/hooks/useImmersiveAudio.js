import { useCallback, useEffect, useRef } from 'react'

function createNoiseBuffer(context) {
  const length = context.sampleRate * 2
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let index = 0; index < length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * 0.28
  }

  return buffer
}

function createImmersiveBus() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const context = new AudioContext()

  const master = context.createGain()
  const humGain = context.createGain()
  const airGain = context.createGain()
  const noiseGain = context.createGain()
  const humFilter = context.createBiquadFilter()
  const airFilter = context.createBiquadFilter()
  const bass = context.createOscillator()
  const air = context.createOscillator()
  const noise = context.createBufferSource()

  master.gain.value = 0
  humGain.gain.value = 0.52
  airGain.gain.value = 0.16
  noiseGain.gain.value = 0.045

  humFilter.type = 'lowpass'
  humFilter.frequency.value = 190
  humFilter.Q.value = 0.8

  airFilter.type = 'bandpass'
  airFilter.frequency.value = 880
  airFilter.Q.value = 0.65

  bass.type = 'sine'
  bass.frequency.value = 58

  air.type = 'triangle'
  air.frequency.value = 147

  noise.buffer = createNoiseBuffer(context)
  noise.loop = true

  bass.connect(humFilter)
  humFilter.connect(humGain)
  humGain.connect(master)

  air.connect(airFilter)
  airFilter.connect(airGain)
  airGain.connect(master)

  noise.connect(airFilter)
  airFilter.connect(noiseGain)
  noiseGain.connect(master)

  master.connect(context.destination)

  bass.start()
  air.start()
  noise.start()

  return {
    context,
    master,
    bass,
    air,
    humFilter,
    airFilter,
    noiseGain,
  }
}

function rampParam(param, value, time, duration = 0.18) {
  param.cancelScheduledValues(time)
  param.setTargetAtTime(value, time, duration)
}

export function useImmersiveAudio(enabled, velocity) {
  const busRef = useRef(null)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    const bus = busRef.current
    if (!bus) return

    const now = bus.context.currentTime
    const intensity = Math.min(1, Math.max(0, velocity))
    const targetGain = enabled ? 0.075 + intensity * 0.075 : 0

    rampParam(bus.master.gain, targetGain, now, 0.22)
    rampParam(bus.bass.frequency, 54 + intensity * 46, now, 0.12)
    rampParam(bus.air.frequency, 142 + intensity * 52, now, 0.18)
    rampParam(bus.humFilter.frequency, 180 + intensity * 190, now, 0.18)
    rampParam(bus.airFilter.frequency, 760 + intensity * 1180, now, 0.18)
    rampParam(bus.noiseGain.gain, 0.035 + intensity * 0.075, now, 0.2)
  }, [enabled, velocity])

  const start = useCallback(async () => {
    if (!busRef.current) {
      busRef.current = createImmersiveBus()
    }

    if (busRef.current.context.state === 'suspended') {
      await busRef.current.context.resume()
    }

    return true
  }, [])

  const stop = useCallback(() => {
    const bus = busRef.current
    if (!bus) return

    rampParam(bus.master.gain, 0, bus.context.currentTime, 0.25)
  }, [])

  const playHover = useCallback((mode = 'hover') => {
    const bus = busRef.current
    if (!enabledRef.current || !bus) return

    const { context } = bus
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()
    const isSelect = mode === 'select'

    oscillator.type = isSelect ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(isSelect ? 172 : 620, now)
    oscillator.frequency.exponentialRampToValueAtTime(isSelect ? 84 : 930, now + (isSelect ? 0.22 : 0.08))

    filter.type = 'lowpass'
    filter.frequency.value = isSelect ? 520 : 1600

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(isSelect ? 0.13 : 0.045, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isSelect ? 0.34 : 0.14))

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + (isSelect ? 0.36 : 0.16))
  }, [])

  return { start, stop, playHover }
}

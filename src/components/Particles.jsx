import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending } from 'three'

export default function Particles({ count = 700, velocity = 0 }) {
  const pointsRef = useRef()
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      const radius = 3 + Math.random() * 9
      const angle = Math.random() * Math.PI * 2
      data[index * 3] = Math.cos(angle) * radius
      data[index * 3 + 1] = (Math.random() - 0.5) * 7
      data[index * 3 + 2] = -Math.random() * 34 + 7
    }
    return data
  }, [count])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = clock.elapsedTime * (0.018 + velocity * 0.035)
    pointsRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.15) * 0.045
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#9beeff"
        transparent
        opacity={0.58}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}

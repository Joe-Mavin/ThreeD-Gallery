import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, BackSide } from 'three'

export default function Atmosphere({ progress, velocity }) {
  const tunnelRef = useRef()
  const coreRef = useRef()

  useFrame(({ clock }) => {
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z = clock.elapsedTime * 0.035 + progress * Math.PI
      tunnelRef.current.material.opacity = 0.06 + velocity * 0.08
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = -clock.elapsedTime * 0.08
      coreRef.current.material.opacity = 0.09 + velocity * 0.11
    }
  })

  return (
    <group>
      <mesh ref={tunnelRef} position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.8, 0.012, 12, 160]} />
        <meshBasicMaterial color="#6adfff" transparent opacity={0.08} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef} position={[0, 0, -12]}>
        <sphereGeometry args={[7.8, 32, 32]} />
        <meshBasicMaterial color="#4d37ff" side={BackSide} transparent opacity={0.1} blending={AdditiveBlending} />
      </mesh>
    </group>
  )
}

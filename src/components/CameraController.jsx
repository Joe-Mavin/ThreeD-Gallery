import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

const targetPosition = new Vector3()
const lookTarget = new Vector3()

export default function CameraController({ progress, velocity, pointer }) {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const px = pointer.x.get()
    const py = pointer.y.get()
    const verticalDrift = Math.sin(progress * Math.PI * 2.8) * 0.75
    const orbitalSway = Math.sin(progress * Math.PI * 5.2) * 0.9
    const breathingDepth = Math.cos(progress * Math.PI * 3.6) * 0.55

    targetPosition.set(px * 1.05 + orbitalSway, verticalDrift + py * -0.5, 7.2 + breathingDepth + velocity * 0.55)
    camera.position.lerp(targetPosition, 1 - Math.exp(-delta * 3.3))

    lookTarget.set(px * 0.55, verticalDrift * 0.35 + py * -0.24, -4.9)
    camera.lookAt(lookTarget)
  })

  return null
}

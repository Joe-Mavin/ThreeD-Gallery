import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

const targetPosition = new Vector3()
const lookTarget = new Vector3()

export default function CameraController({ progress, velocity, pointer }) {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const px = pointer.x.get()
    const py = pointer.y.get()
    const depth = progress * -22
    const sway = Math.sin(progress * Math.PI * 3.2) * 0.58

    targetPosition.set(px * 1.25 + sway, 0.25 + py * -0.55, 8 + depth + velocity * 0.55)
    camera.position.lerp(targetPosition, 1 - Math.exp(-delta * 3.3))

    lookTarget.set(px * 0.65, py * -0.36, depth - 4.5)
    camera.lookAt(lookTarget)
  })

  return null
}

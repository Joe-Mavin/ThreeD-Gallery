import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Suspense, useMemo, useState } from 'react'
import SpiralCards from './SpiralCards'
import CameraController from './CameraController'
import Particles from './Particles'
import Atmosphere from './Atmosphere'

export default function GalleryScene({ cards, progress, velocity, pointer, onCardSelect, onCardHover }) {
  const [quality, setQuality] = useState(1)
  const isMobile = useMemo(() => window.matchMedia('(max-width: 720px)').matches, [])
  const visibleCards = isMobile ? cards.slice(0, 8) : cards

  return (
    <Canvas
      dpr={[1, quality > 0.75 ? 1.65 : 1.2]}
      camera={{ position: [0, 0.25, 8], fov: isMobile ? 66 : 58, near: 0.1, far: 90 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
    >
      <color attach="background" args={['#02040d']} />
      <fog attach="fog" args={['#050716', 7, 33]} />
      <PerformanceMonitor onDecline={() => setQuality(0.65)} onIncline={() => setQuality(1)} />
      <Suspense fallback={null}>
        <CameraController progress={progress} velocity={velocity} pointer={pointer} />
        <ambientLight intensity={0.22} />
        <directionalLight position={[3, 5, 6]} intensity={1.35} color="#b6f7ff" />
        <pointLight position={[-4, 2, 1]} intensity={6 + velocity * 6} color="#735bff" distance={12} />
        <pointLight position={[4, -2, -8]} intensity={5} color="#00e5ff" distance={18} />
        <Atmosphere progress={progress} velocity={velocity} />
        <Particles count={isMobile ? 420 : 920} velocity={velocity} />
        <SpiralCards
          cards={visibleCards}
          progress={progress}
          velocity={velocity}
          isMobile={isMobile}
          onCardSelect={onCardSelect}
          onCardHover={onCardHover}
        />
        <EffectComposer multisampling={quality > 0.75 ? 4 : 0}>
          <Bloom intensity={0.72 + velocity * 0.52} luminanceThreshold={0.18} luminanceSmoothing={0.52} mipmapBlur />
          <Noise opacity={0.045} />
          <Vignette eskil={false} offset={0.2} darkness={0.72} />
        </EffectComposer>
      </Suspense>
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  )
}

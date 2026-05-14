import { Float, Html, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { UploadCloud } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { AdditiveBlending, Color } from 'three'

function CardFace({ card, hovered, onClick }) {
  return (
    <Html transform distanceFactor={1.55} position={[0, 0, 0.036]} zIndexRange={[20, 0]} style={{ pointerEvents: 'auto' }}>
      <button
        type="button"
        className={`card-face ${hovered ? 'is-hovered' : ''}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
        aria-label={`Open ${card.title}`}
      >
        <span className="placeholder-zone shimmer">
          <UploadCloud size={21} />
        </span>
        <span className="card-meta">
          <span className="card-tag">{card.category}</span>
          <span className="card-dot" style={{ backgroundColor: card.accent, boxShadow: `0 0 18px ${card.accent}` }} />
        </span>
        <span className="card-title">{card.title}</span>
      </button>
    </Html>
  )
}

function HelixCard({ card, index, total, progress, velocity, isMobile, onCardSelect, onCardHover }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const [hovered, setHovered] = useState(false)
  const accent = useMemo(() => new Color(card.accent), [card.accent])
  const selectCard = () => onCardSelect(card)

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    const spacing = isMobile ? 1.7 : 1.9
    const radius = isMobile ? 2.25 : 3.35
    const helixTurns = Math.PI * 2.35
    const base = index / total
    const angle = base * Math.PI * 2 + progress * helixTurns + clock.elapsedTime * (0.045 + velocity * 0.08)
    const z = 4.2 - index * spacing + progress * total * spacing * 0.96
    const y = Math.sin(clock.elapsedTime * 0.8 + index) * 0.13

    group.position.x += (Math.cos(angle) * radius - group.position.x) * (1 - Math.exp(-delta * 5.4))
    group.position.y += (Math.sin(angle * 0.72) * 0.85 + y - group.position.y) * (1 - Math.exp(-delta * 4.2))
    group.position.z += (z - group.position.z) * (1 - Math.exp(-delta * 4.8))
    group.rotation.y += (angle + Math.PI - group.rotation.y) * (1 - Math.exp(-delta * 3.5))
    group.rotation.x = Math.sin(clock.elapsedTime * 0.55 + index) * 0.08
    group.rotation.z = Math.cos(clock.elapsedTime * 0.45 + index * 0.4) * 0.045
    group.scale.lerp({ x: hovered ? 1.12 : 1, y: hovered ? 1.12 : 1, z: hovered ? 1.12 : 1 }, 1 - Math.exp(-delta * 9))

    if (materialRef.current) {
      materialRef.current.opacity += ((hovered ? 0.46 : 0.26) - materialRef.current.opacity) * 0.08
      materialRef.current.emissiveIntensity += ((hovered ? 0.8 : 0.32) - materialRef.current.emissiveIntensity) * 0.08
    }
  })

  return (
    <Float speed={1.4} floatIntensity={0.24} rotationIntensity={0.08}>
      <group
        ref={groupRef}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          onCardHover()
          document.body.classList.add('has-card-hover')
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.classList.remove('has-card-hover')
        }}
        onClick={(event) => {
          event.stopPropagation()
          selectCard()
        }}
      >
        <RoundedBox args={[2.35, 1.48, 0.055]} radius={0.11} smoothness={8}>
          <meshPhysicalMaterial
            ref={materialRef}
            color="#101827"
            emissive={accent}
            emissiveIntensity={0.3}
            metalness={0.18}
            roughness={0.24}
            transmission={0.3}
            transparent
            opacity={0.28}
            clearcoat={1}
            clearcoatRoughness={0.12}
          />
        </RoundedBox>
        <RoundedBox args={[2.45, 1.58, 0.02]} radius={0.14} smoothness={8} position={[0, 0, -0.022]}>
          <meshBasicMaterial color={accent} transparent opacity={hovered ? 0.22 : 0.11} blending={AdditiveBlending} />
        </RoundedBox>
        <CardFace card={card} hovered={hovered} onClick={selectCard} />
      </group>
    </Float>
  )
}

export default function SpiralCards({ cards, progress, velocity, isMobile, onCardSelect, onCardHover }) {
  const rigRef = useRef()

  useFrame((_, delta) => {
    if (!rigRef.current) return
    const target = progress * Math.PI * 1.2
    rigRef.current.rotation.y += (target - rigRef.current.rotation.y) * (1 - Math.exp(-delta * (1.8 + velocity * 2.5)))
  })

  return (
    <group ref={rigRef}>
      {cards.map((card, index) => (
        <HelixCard
          key={card.id}
          card={card}
          index={index}
          total={cards.length}
          progress={progress}
          velocity={velocity}
          isMobile={isMobile}
          onCardSelect={onCardSelect}
          onCardHover={onCardHover}
        />
      ))}
    </group>
  )
}

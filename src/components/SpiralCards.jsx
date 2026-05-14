import { Float, Html, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { UploadCloud } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { AdditiveBlending, Color } from 'three'

function ImageSlot({ card }) {
  const [failed, setFailed] = useState(false)
  const showImage = card.image?.src && !failed

  return (
    <span className={`placeholder-zone ${showImage ? 'has-image' : 'shimmer'}`}>
      {showImage ? (
        <img
          src={card.image.src}
          width={card.image.width}
          height={card.image.height}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="placeholder-copy">
          <UploadCloud size={21} />
          <span>{card.image?.width || 1200} x {card.image?.height || 760}</span>
        </span>
      )}
    </span>
  )
}

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
        <ImageSlot card={card} />
        <span className="card-meta">
          <span className="card-tag">{card.category}</span>
          <span className="card-dot" style={{ backgroundColor: card.accent, boxShadow: `0 0 18px ${card.accent}` }} />
        </span>
        <span className="card-title">{card.title}</span>
      </button>
    </Html>
  )
}

function HelixCard({ card, index, total, progress, velocity, focusedCardId, isMobile, onCardSelect, onCardHover }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const [hovered, setHovered] = useState(false)
  const accent = useMemo(() => new Color(card.accent), [card.accent])
  const isFocused = focusedCardId === card.id
  const selectCard = () => onCardSelect(card)

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    const spacing = isMobile ? 1.84 : 2.18
    const radius = isMobile ? 2.05 : 3.2
    const helixTurns = Math.PI * 3.35
    const verticalSpan = total * spacing
    const scrollLift = progress * verticalSpan * 0.48
    const base = index / total
    const angle = base * Math.PI * 2 + progress * helixTurns + clock.elapsedTime * (0.045 + velocity * 0.08)
    const verticalLoop = ((index * spacing - scrollLift + verticalSpan * 0.5) % verticalSpan) - verticalSpan * 0.5
    const y = verticalLoop + Math.sin(clock.elapsedTime * 0.8 + index) * 0.16
    const z = Math.sin(angle) * (isMobile ? 1.15 : 1.75) - 4.8 + Math.cos(progress * Math.PI * 2 + index) * 0.28

    const targetX = isFocused ? 0 : Math.cos(angle) * radius
    const targetY = isFocused ? 0.03 : y
    const targetZ = isFocused ? 1.75 : z
    const targetRotationY = isFocused ? 0 : angle + Math.PI * 0.5

    group.position.x += (targetX - group.position.x) * (1 - Math.exp(-delta * (isFocused ? 7.8 : 4.2)))
    group.position.y += (targetY - group.position.y) * (1 - Math.exp(-delta * (isFocused ? 7.4 : 3.2)))
    group.position.z += (targetZ - group.position.z) * (1 - Math.exp(-delta * (isFocused ? 8.4 : 3.8)))
    group.rotation.y += (targetRotationY - group.rotation.y) * (1 - Math.exp(-delta * (isFocused ? 7.2 : 2.8)))
    group.rotation.x = Math.sin(clock.elapsedTime * 0.55 + index) * 0.08
    group.rotation.z = isFocused ? 0 : Math.cos(clock.elapsedTime * 0.45 + index * 0.4) * 0.045
    const targetScale = isFocused ? 1.46 : hovered ? 1.12 : 1
    group.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 1 - Math.exp(-delta * 9))

    if (materialRef.current) {
      materialRef.current.opacity += ((isFocused ? 0.58 : hovered ? 0.46 : 0.26) - materialRef.current.opacity) * 0.08
      materialRef.current.emissiveIntensity += ((isFocused ? 1.1 : hovered ? 0.8 : 0.32) - materialRef.current.emissiveIntensity) * 0.08
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

export default function SpiralCards({ cards, progress, velocity, focusedCardId, isMobile, onCardSelect, onCardHover }) {
  const rigRef = useRef()

  useFrame((_, delta) => {
    if (!rigRef.current) return
    const target = progress * Math.PI * 1.72
    rigRef.current.rotation.y += (target - rigRef.current.rotation.y) * (1 - Math.exp(-delta * (1.15 + velocity * 1.4)))
    rigRef.current.position.y += (Math.sin(progress * Math.PI * 2) * 0.16 - rigRef.current.position.y) * (1 - Math.exp(-delta * 1.8))
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
          focusedCardId={focusedCardId}
          isMobile={isMobile}
          onCardSelect={onCardSelect}
          onCardHover={onCardHover}
        />
      ))}
    </group>
  )
}

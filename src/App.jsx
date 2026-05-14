import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { Pause, Play, Sparkles, UploadCloud, Volume2, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import GalleryScene from './components/GalleryScene'
import { useImmersiveAudio } from './hooks/useImmersiveAudio'
import { useScrollRig } from './hooks/useScrollRig'
import { galleryCards } from './data/galleryCards'

function ModalImage({ card }) {
  const [failed, setFailed] = useState(false)
  const showImage = card.image?.src && !failed

  return (
    <div className={`modal-image ${showImage ? 'has-image' : 'shimmer'}`}>
      {showImage ? (
        <img
          src={card.image.src}
          width={card.image.width}
          height={card.image.height}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          <UploadCloud size={24} />
          {card.image?.width || 1200} x {card.image?.height || 760}
        </span>
      )}
    </div>
  )
}

function App() {
  const [selectedCard, setSelectedCard] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 24, mass: 0.35 })
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 24, mass: 0.35 })
  const rig = useScrollRig()
  const cursorRef = useRef(null)
  const audio = useImmersiveAudio(audioEnabled, rig.velocity)

  const activeMeta = useMemo(() => {
    const index = Math.min(galleryCards.length - 1, Math.max(0, Math.floor(rig.progress * galleryCards.length)))
    return galleryCards[index]
  }, [rig.progress])

  const handlePointerMove = (event) => {
    const x = event.clientX / window.innerWidth - 0.5
    const y = event.clientY / window.innerHeight - 0.5
    pointerX.set(x)
    pointerY.set(y)

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    }
  }

  const toggleAudio = async () => {
    const next = !audioEnabled
    setAudioEnabled(next)
    if (next) {
      await audio.start()
    } else {
      audio.stop()
    }
  }

  return (
    <main
      className="relative min-h-[620vh] overflow-clip bg-void text-white selection:bg-cyan-300 selection:text-black"
      onPointerMove={handlePointerMove}
    >
      <div className="fixed inset-0 z-0">
        <GalleryScene
          cards={galleryCards}
          progress={rig.progress}
          velocity={rig.velocity}
          pointer={{ x: smoothX, y: smoothY }}
          onCardSelect={(card) => {
            audio.playHover('select')
            setSelectedCard(card)
          }}
          onCardHover={() => audio.playHover('hover')}
        />
      </div>

      <motion.div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/30 bg-cyan-200/10 blur-[1px] mix-blend-screen lg:block"
        style={{
          opacity: audioEnabled ? 0.65 : 0.35,
        }}
      />

      <section className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-100/70">
            <Sparkles size={14} />
            <span>Helix Archive</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-balance font-display text-5xl font-semibold leading-[0.92] tracking-normal text-white sm:text-7xl lg:text-8xl">
            Cinematic AI Gallery
          </h1>
        </div>

        <button
          type="button"
          onClick={toggleAudio}
          className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/8 text-cyan-50 shadow-[0_0_35px_rgba(64,224,255,0.18)] backdrop-blur-xl transition hover:border-cyan-200/50 hover:bg-cyan-200/15"
          aria-label={audioEnabled ? 'Pause ambient audio' : 'Play ambient audio'}
        >
          {audioEnabled ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </section>

      <aside className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 grid gap-5 px-5 pb-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <motion.p
            key={activeMeta.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl text-sm leading-6 text-white/62 sm:text-base"
          >
            {activeMeta.description}
          </motion.p>
        </div>

        <div className="flex items-end justify-between gap-5 lg:min-w-80">
          <div className="w-44">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-white/45">
              <span>Scroll depth</span>
              <span>{Math.round(rig.progress * 100)}%</span>
            </div>
            <div className="h-px overflow-hidden rounded-full bg-white/15">
              <motion.div className="h-full bg-cyan-200" style={{ scaleX: rig.motionProgress, transformOrigin: '0% 50%' }} />
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-3 text-xs text-white/55 backdrop-blur-xl sm:flex">
            <Volume2 size={15} className={audioEnabled ? 'text-cyan-200' : 'text-white/35'} />
            <span>{audioEnabled ? 'Reactive audio live' : 'Tap audio for ambience'}</span>
          </div>
        </div>
      </aside>

      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(3,5,18,0.18)_42%,rgba(3,5,18,0.78)_100%)]" />

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/48 px-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.article
              className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/16 bg-[#07101c]/84 p-6 shadow-[0_0_90px_rgba(80,130,255,0.28)]"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ type: 'spring', stiffness: 150, damping: 22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/8 text-white/75 transition hover:bg-white/14"
                onClick={() => setSelectedCard(null)}
                aria-label="Close card details"
              >
                <X size={18} />
              </button>
              <ModalImage card={selectedCard} />
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
                  {selectedCard.category}
                </span>
                <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
              </div>
              <h2 className="font-display text-4xl font-semibold tracking-normal">{selectedCard.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">{selectedCard.description}</p>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App

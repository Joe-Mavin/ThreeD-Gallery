# Onyango JP Cinematic Photo Gallery

A premium interactive 3D photo gallery built with React, React Three Fiber, Three.js, Tailwind CSS, Framer Motion, Drei, postprocessing, and Howler/Web Audio.

The experience presents photo cards in a vertical helix. As visitors scroll, the cards orbit smoothly through a dark cinematic space with bloom, particles, fog, parallax, hover glow, reactive ambience, and a card focus transition.

## Features

- Vertical spiral/helix photo gallery
- Scroll-driven 3D camera and card movement
- Smooth damped motion with scroll inertia
- Click-to-focus card transition before modal open
- Glassmorphism card styling with neon edge glow
- Local photo placeholders with fixed dimensions
- Responsive object count for mobile/tablet
- Bloom, noise, vignette, fog, ambient lights, and particles
- Optional reactive audio ambience

## Tech Stack

- React + Vite
- React Three Fiber
- Three.js
- Drei
- @react-three/postprocessing
- Tailwind CSS
- Framer Motion
- Howler.js
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint the project:

```bash
npm run lint
```

## Adding Photos

Place your gallery images in:

```text
public/gallery/
```

Recommended image dimensions:

```text
1200 x 760px
Aspect ratio: 30:19
Format: JPG or WEBP
```

Expected filenames are listed in:

```text
public/gallery/README.md
```

Each card image is configured in:

```text
src/data/galleryCards.js
```

Example card image config:

```js
image: {
  src: '/gallery/spectral-foundry.jpg',
  width: 1200,
  height: 760,
}
```

If an image is missing, the app automatically shows a polished placeholder with the required dimensions.

## Project Structure

```text
src/
  App.jsx
  components/
    Atmosphere.jsx
    CameraController.jsx
    GalleryScene.jsx
    Particles.jsx
    SpiralCards.jsx
  data/
    galleryCards.js
  hooks/
    useImmersiveAudio.js
    useScrollRig.js
  index.css
```

## Notes

The production build may show a large chunk warning because Three.js, React Three Fiber, Drei, and postprocessing are substantial WebGL dependencies. The warning does not prevent the app from building or running.

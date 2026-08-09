/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import styles from './Lanyard.module.css';

extend({ MeshLineGeometry, MeshLineMaterial });

const CARD_GLB_URL = '/lanyard/card.glb';
const DEFAULT_LANYARD_TEXTURE = '/lanyard/lanyard-band.png';

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

// The atlas ships with reactbits.dev branding baked onto both faces (an atom on
// the front, the logo + wordmark on the back), so a custom image that does not
// reach the card's edges leaves that branding showing around it. Neither face's
// UVs go below v≈0.757, which leaves the bottom of the atlas as untouched blank
// paper — tiling a patch of it over a face wipes the branding while keeping the
// card's paper grain, which a flat colour fill would lose.
const PAPER_PATCH = { x: 0.05, y: 0.79, w: 0.4, h: 0.18 };

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  fitCardToImage = false,
  cardAspect = null,
  overlayImage = null,
  overlayScale = 1,
  overlayOffset = [0, 0],
  lanyardImage = null,
  lanyardWidth = 1,
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const wrapperRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The scene animates continuously, so leaving it running while the section is
  // scrolled away costs a physics step + a full redraw every frame for nothing.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className={styles.lanyardWrapper}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            fitCardToImage={fitCardToImage}
            cardAspect={cardAspect}
            overlayImage={overlayImage}
            overlayScale={overlayScale}
            overlayOffset={overlayOffset}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  fitCardToImage = false,
  cardAspect = null,
  overlayImage = null,
  overlayScale = 1,
  overlayOffset = [0, 0],
  lanyardImage = null,
  lanyardWidth = 1,
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  // meshline derives its screen-space width from this, so it has to track the
  // real canvas size — a fixed guess makes the band render at the wrong width.
  const { width, height } = useThree((state) => state.size);
  const { nodes, materials } = useGLTF(CARD_GLB_URL);
  const texture = useTexture(lanyardImage || DEFAULT_LANYARD_TEXTURE);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);
  const overlayTex = useTexture(overlayImage || BLANK_PIXEL);

  // The card mesh's real face box, measured from the model. Its native shape is
  // portrait (~0.716 x 1.0); reshaping means scaling X away from that.
  const cardFace = useMemo(() => {
    const geometry = nodes.card.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    const w = max.x - min.x;
    const h = max.y - min.y;
    return { w, h, centerY: (min.y + max.y) / 2, frontZ: max.z, aspect: w / h };
  }, [nodes.card.geometry]);

  // Widen (or narrow) the card mesh to hit a target aspect ratio. An explicit
  // cardAspect wins; otherwise fitCardToImage derives it from the front image.
  let cardScaleX = 1;
  if (cardAspect) {
    cardScaleX = cardAspect / cardFace.aspect;
  } else if (fitCardToImage && frontImage && frontTex.image) {
    cardScaleX = frontTex.image.width / frontTex.image.height / cardFace.aspect;
  }
  // The shape the card actually ends up as, once scaled.
  const targetAspect = cardFace.aspect * cardScaleX;

  useEffect(() => {
    if (!overlayImage) return;
    overlayTex.colorSpace = THREE.SRGBColorSpace;
    overlayTex.anisotropy = 16;
    overlayTex.needsUpdate = true;
  }, [overlayImage, overlayTex]);

  // The overlay lives on its own plane in front of the card rather than in the
  // card's texture, which is what lets it hang past the card's edges — a texture
  // can only paint where geometry exists.
  const overlay = useMemo(() => {
    if (!overlayImage || !overlayTex.image) return null;
    const h = cardFace.h * overlayScale;
    return { w: h * (overlayTex.image.width / overlayTex.image.height), h };
  }, [overlayImage, overlayTex, cardFace.h, overlayScale]);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    // overlayImage counts too: it covers the front face, so the baked art has to
    // go even though nothing is composited into the front rect.
    if (!frontImage && !backImage && !overlayImage) return baseMap;

    const baseImg = baseMap.image;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    // Tile blank paper over a face so the baked branding underneath is gone
    // before the custom image lands on top of it.
    const wipeFace = (rect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const sx = PAPER_PATCH.x * W;
      const sy = PAPER_PATCH.y * H;
      const sw = PAPER_PATCH.w * W;
      const sh = PAPER_PATCH.h * H;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      for (let y = ry; y < ry + rh; y += sh) {
        for (let x = rx; x < rx + rw; x += sw) {
          ctx.drawImage(baseImg, sx, sy, sw, sh, x, y, sw, sh);
        }
      }
      ctx.restore();
    };

    const drawFitted = (img, rect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      // A square of atlas pixels does not land as a square on the card: this
      // rect is stretched onto a face of targetAspect. Convert the image's
      // aspect into rect space first, otherwise the fit comes out distorted.
      const boxAspect = ((img.width / img.height) * (rw / rh)) / targetAspect;
      const rectAspect = rw / rh;
      const fillWidth = imageFit === 'contain' ? rectAspect <= boxAspect : rectAspect > boxAspect;
      const dw = fillWidth ? rw : rh * boxAspect;
      const dh = fillWidth ? rw / boxAspect : rh;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    // Strip the branding off both faces up front. A face left without a custom
    // image then reads as blank card stock rather than someone else's logo.
    wipeFace(FRONT_UV_RECT);
    wipeFace(BACK_UV_RECT);

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, overlayImage, imageFit, targetAspect, frontTex, backTex, materials.base.map]);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    // A slow frame (or a tab that just regained focus) reports a large delta.
    // Cap it so the band catches up smoothly instead of teleporting.
    const dt = Math.min(delta, 1 / 30);
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        // The alpha here is dt * up-to-maxSpeed, which passes 1 whenever the
        // frame rate drops below ~50fps — an unclamped lerp then overshoots
        // its target and the strap snaps. Clamp it to keep the ease stable.
        ref.current.lerped.lerp(
          ref.current.translation(),
          Math.min(1, dt * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8 * cardScaleX, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry} scale={[cardScaleX, 1, 1]}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            {overlay && (
              <mesh
                position={[overlayOffset[0], cardFace.centerY + overlayOffset[1], cardFace.frontZ + 0.004]}
              >
                <planeGeometry args={[overlay.w, overlay.h]} />
                <meshBasicMaterial map={overlayTex} transparent depthWrite={false} toneMapped={false} />
              </mesh>
            )}
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_GLB_URL);

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGlobeStore } from '../lib/store';
import { lerp } from '../utils/smoothing';
import { celestialBodies, createRingTexture } from '../utils/celestialBodies';

export const Globe: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const globeMeshRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const rotationVelocity = useRef({ x: 0, y: 0 });

  const selectedBodyId = useGlobeStore((state) => state.selectedBodyId);

  // Pre-loaded Earth local textures
  const [earthColorMap, earthSpecularMap, earthNormalMap] = useTexture([
    '/earth_atmos.jpg',
    '/earth_specular.jpg',
    '/earth_normal.jpg'
  ]);

  // Pre-loaded high-fidelity planet and Sun textures from verified public CDN
  const planetTextures = useTexture({
    sun: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/sunmap.jpg',
    mercury: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/mercurymap.jpg',
    mercuryBump: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/mercurybump.jpg',
    venus: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/venusmap.jpg',
    venusBump: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/venusbump.jpg',
    mars: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/marsmap1k.jpg',
    marsBump: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/marsbump1k.jpg',
    jupiter: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/jupitermap.jpg',
    saturn: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/saturnmap.jpg',
    uranus: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/uranusmap.jpg',
    neptune: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/neptunemap.jpg',
    moon: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/moonmap1k.jpg',
    moonBump: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/moonbump1k.jpg'
  });

  const currentBody = useMemo(() => {
    return celestialBodies.find((b) => b.id === selectedBodyId) || celestialBodies[3]; // Fallback to Earth
  }, [selectedBodyId]);

  // Active color map
  const activeColorMap = useMemo(() => {
    if (selectedBodyId === 'earth') {
      return earthColorMap;
    }
    return planetTextures[selectedBodyId as keyof typeof planetTextures] || null;
  }, [selectedBodyId, earthColorMap, planetTextures]);

  // Procedural ring texture for Saturn/Uranus
  const ringTexture = useMemo(() => {
    if (selectedBodyId === 'saturn' || selectedBodyId === 'uranus') {
      const canvas = createRingTexture(selectedBodyId);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }
    return null;
  }, [selectedBodyId]);

  // Clean up procedural ring texture on unmount/change
  useEffect(() => {
    return () => {
      if (ringTexture) {
        ringTexture.dispose();
      }
    };
  }, [ringTexture]);
  
  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const globeState = useGlobeStore.getState();
    const { handPosition, distance, isFist, trackingActive, spinDelta } = globeState;

    // 1. Position Interpolation (Lerp)
    if (trackingActive && handPosition) {
      // Map Mediapipe normalized coordinates (0-1) to Three.js viewport space
      const targetX = -(handPosition.x - 0.5) * viewport.width;
      // Add a gap (+2) so it floats above the hand
      const targetY = -(handPosition.y - 0.5) * viewport.height + 2;
      const targetZ = handPosition.z * -5;

      meshRef.current.position.x = lerp(meshRef.current.position.x, targetX, 0.15);
      meshRef.current.position.y = lerp(meshRef.current.position.y, targetY, 0.15);
      meshRef.current.position.z = lerp(meshRef.current.position.z, targetZ, 0.15);
      
      meshRef.current.visible = true;
    } else {
      // Return to center if not tracking
      meshRef.current.position.x = lerp(meshRef.current.position.x, 0, 0.05);
      meshRef.current.position.y = lerp(meshRef.current.position.y, 0, 0.05);
      meshRef.current.position.z = lerp(meshRef.current.position.z, 0, 0.05);
    }

    // 2. Scale Interpolation (Zoom with responsive base scaling)
    const baseScale = Math.max(0.95, Math.min(viewport.width * 0.22, 1.8));
    const targetScale = distance * baseScale;
    meshRef.current.scale.x = lerp(meshRef.current.scale.x, targetScale, 0.1);
    meshRef.current.scale.y = lerp(meshRef.current.scale.y, targetScale, 0.1);
    meshRef.current.scale.z = lerp(meshRef.current.scale.z, targetScale, 0.1);

    // 3. Rotation
    if (!isFist && globeMeshRef.current) {
      if (Math.abs(spinDelta.x) > 0.001) { 
        // Second hand is moving horizontally, apply momentum in Y axis
        rotationVelocity.current.x = lerp(rotationVelocity.current.x, spinDelta.x * 50, 0.1);
        globeMeshRef.current.rotation.y += rotationVelocity.current.x * delta;
      } else {
        // Slow auto-spin and decay velocity for smooth stopping
        rotationVelocity.current.x = lerp(rotationVelocity.current.x, 0, 0.05);
        globeMeshRef.current.rotation.y += (rotationVelocity.current.x + 0.5) * delta;
      }
      
      // Lock rotation to the central Y axis only
      globeMeshRef.current.rotation.x = 0;
      globeMeshRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={meshRef}>
      <group ref={globeMeshRef}>
        {/* Sphere Core */}
        <mesh key={`planet-${selectedBodyId}`}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            key={`mat-${selectedBodyId}`}
            map={activeColorMap}
            // Explicitly set maps to null when not on Earth to prevent R3F texture leakage
            normalMap={selectedBodyId === 'earth' ? earthNormalMap : null}
            roughnessMap={selectedBodyId === 'earth' ? earthSpecularMap : null}
            // Apply bump maps for terrestrial bodies only (gas giants/Sun are smooth)
            bumpMap={
              selectedBodyId === 'mercury' ? planetTextures.mercuryBump :
              selectedBodyId === 'venus' ? planetTextures.venusBump :
              selectedBodyId === 'mars' ? planetTextures.marsBump :
              selectedBodyId === 'moon' ? planetTextures.moonBump :
              null
            }
            bumpScale={0.012}
            roughness={currentBody.roughness}
            metalness={currentBody.metalness}
            emissive={currentBody.emissive ? new THREE.Color(currentBody.color) : new THREE.Color('#000000')}
            emissiveIntensity={currentBody.emissive ? 1.6 : 0}
          />
        </mesh>

        {/* Saturn's Ring System */}
        {selectedBodyId === 'saturn' && ringTexture && (
          <mesh rotation={[Math.PI / 2.1, 0, 0]}>
            <ringGeometry args={[1.3, 2.5, 64]} />
            <meshStandardMaterial
              map={ringTexture}
              transparent
              side={THREE.DoubleSide}
              opacity={0.85}
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
        )}

        {/* Uranus's Tilted Ring System */}
        {selectedBodyId === 'uranus' && ringTexture && (
          <mesh rotation={[Math.PI / 10, Math.PI / 2, 0]}>
            <ringGeometry args={[1.3, 1.6, 64]} />
            <meshStandardMaterial
              map={ringTexture}
              transparent
              side={THREE.DoubleSide}
              opacity={0.6}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        )}
      </group>

      {/* Dynamic atmosphere glow matched to selected planet/Sun */}
      <mesh key={`glow-${selectedBodyId}`}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial 
          color={currentBody.color} 
          transparent 
          opacity={selectedBodyId === 'sun' ? 0.35 : 0.15} 
          side={THREE.BackSide} 
        />
      </mesh>
    </group>
  );
};

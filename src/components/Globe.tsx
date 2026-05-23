import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGlobeStore } from '../lib/store';
import { lerp } from '../utils/smoothing';

export const Globe: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const globeMeshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const rotationVelocity = useRef({ x: 0, y: 0 });

  const [colorMap, specularMap, normalMap] = useTexture([
    '/earth_atmos.jpg',
    '/earth_specular.jpg',
    '/earth_normal.jpg'
  ]);
  
  // We don't subscribe to the store React-style to avoid re-renders.
  // Instead, we read from the store's current state inside useFrame.
  
  // Create a nice material for the globe
  // For a premium look, we'll use a standard material with a wireframe or custom texture
  // A glowing effect would be nice, but we'll stick to a high-tech wireframe + solid core
  
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

    // 2. Scale Interpolation (Zoom)
    // Base scale is 1, modified by distance
    const targetScale = distance * 2; // base size
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
      <mesh ref={globeMeshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={specularMap}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>
      {/* Subtle Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

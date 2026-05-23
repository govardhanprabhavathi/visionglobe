import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Globe } from './Globe';

export const GlobeScene: React.FC = () => {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFFFFF" />
        
        <Suspense fallback={null}>
          <Globe />
          {/* Environment maps for nice reflections on the globe */}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGlobeStore } from '../store';
import type { GlobeNode } from '../store';

// Helper to convert lat/lng to 3D Cartesian coordinates
const convertLatLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
};

// Component for a connection line between two nodes
interface ConnectionArcProps {
  startNode: GlobeNode;
  endNode: GlobeNode;
  radius: number;
}

const ConnectionArc: React.FC<ConnectionArcProps> = ({ startNode, endNode, radius }) => {
  const startVec = useMemo(() => convertLatLngToVector3(startNode.lat, startNode.lng, radius), [startNode, radius]);
  const endVec = useMemo(() => convertLatLngToVector3(endNode.lat, endNode.lng, radius), [endNode, radius]);

  // Calculate curve points
  const { curve, linePoints } = useMemo(() => {
    // Determine the mid-point and elevate it outward to create an arc
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    const distance = startVec.distanceTo(endVec);
    const arcHeight = radius + distance * 0.15; // Arc height scales with distance
    midPoint.normalize().multiplyScalar(arcHeight);

    // Create a quadratic bezier curve
    const path = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
    const points = path.getPoints(50);
    return { curve: path, linePoints: points };
  }, [startVec, endVec, radius]);

  // Animated packet traveling along the curve
  const packetRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!packetRef.current) return;
    const t = (clock.getElapsedTime() * 0.4) % 1; // Cycle speed
    const pos = curve.getPointAt(t);
    packetRef.current.position.copy(pos);
  });

  return (
    <group>
      {/* Curved connection line */}
      <line>
        <bufferGeometry attach="geometry">
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array(linePoints.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          attach="material"
          color="#38bdf8"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* Animated data packet */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

// Main Scene Controller (handles rotations and camera zoom)
const SceneController: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const {
    autoRotate,
    rotationSpeed,
    cameraRotation,
    updateCameraRotation,
    zoomFactor,
    nodes,
    activeNode,
    setActiveNode
  } = useGlobeStore();

  const radius = 2.5;

  // Track dragging variables
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Apply auto-rotation if enabled
    if (autoRotate) {
      const deltaY = rotationSpeed * delta;
      updateCameraRotation(deltaY, 0);
    }

    // Smoothly interpolate group rotation towards target angles
    const currentRot = groupRef.current.rotation;
    // Y-rotation corresponds to cameraRotation[0] (longitude), X-rotation to cameraRotation[1] (latitude)
    currentRot.y = THREE.MathUtils.lerp(currentRot.y, cameraRotation[0], 0.1);
    currentRot.x = THREE.MathUtils.lerp(currentRot.x, cameraRotation[1], 0.1);

    // Smoothly interpolate camera position based on zoom factor
    const targetZ = 6.5 * zoomFactor;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.15);
  });

  // Unique lists of connections to prevent drawing twice
  const connections = useMemo(() => {
    const list: { from: GlobeNode; to: GlobeNode; key: string }[] = [];
    const visited = new Set<string>();

    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) {
          const key1 = `${node.id}-${targetNode.id}`;
          const key2 = `${targetNode.id}-${node.id}`;
          if (!visited.has(key1) && !visited.has(key2)) {
            list.push({ from: node, to: targetNode, key: key1 });
            visited.add(key1);
          }
        }
      });
    });
    return list;
  }, [nodes]);

  // Node Cartesian positions
  const nodePositions = useMemo(() => {
    return nodes.map(node => ({
      node,
      pos: convertLatLngToVector3(node.lat, node.lng, radius)
    }));
  }, [nodes, radius]);

  // Handle manual dragging to rotate
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    
    // Scale delta for smooth dragging rotation
    const rotationSpeedScale = 0.007;
    updateCameraRotation(deltaX * rotationSpeedScale, deltaY * rotationSpeedScale);
    
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    >
      {/* Inner solid sphere */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial color="#050b18" transparent opacity={0.88} />
      </mesh>

      {/* Lat/Lng grid wireframe */}
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#1e293b"
          wireframe
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Glow Shield */}
      <mesh>
        <sphereGeometry args={[radius * 1.015, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Equator & Meridians accent lines */}
      <gridHelper args={[radius * 2, 10, '#38bdf8', '#1e293b']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />

      {/* Render connections (Arcs) */}
      {connections.map(conn => (
        <ConnectionArc
          key={conn.key}
          startNode={conn.from}
          endNode={conn.to}
          radius={radius}
        />
      ))}

      {/* Render Node Markers */}
      {nodePositions.map(({ node, pos }) => {
        const isActive = activeNode?.id === node.id;
        const color = node.metrics.status === 'online' ? '#10b981' : '#f59e0b';
        
        return (
          <group key={node.id} position={[pos.x, pos.y, pos.z]}>
            {/* Clickable interactive sphere marker */}
            <mesh onClick={(e) => {
              e.stopPropagation();
              setActiveNode(isActive ? null : node.id);
            }}>
              <sphereGeometry args={[isActive ? 0.09 : 0.06, 16, 16]} />
              <meshBasicMaterial color={isActive ? '#ec4899' : color} />
            </mesh>

            {/* Glowing ring under node */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[isActive ? 0.12 : 0.08, isActive ? 0.15 : 0.1, 16]} />
              <meshBasicMaterial
                color={isActive ? '#ec4899' : color}
                side={THREE.DoubleSide}
                transparent
                opacity={0.6}
              />
            </mesh>

            {/* Futuristic floating HTML tag */}
            <Html distanceFactor={6} center style={{ pointerEvents: 'none' }}>
              <div
                className="text-[9px] text-cyber whitespace-nowrap px-2 py-0.5 rounded border glass-panel font-semibold"
                style={{
                  color: isActive ? '#ec4899' : '#38bdf8',
                  borderColor: isActive ? 'rgba(236, 72, 153, 0.4)' : 'rgba(56, 189, 248, 0.3)',
                  backgroundColor: 'rgba(5, 11, 24, 0.85)',
                  transform: 'translateY(-18px)',
                  boxShadow: isActive ? 'var(--shadow-glow-pink)' : 'var(--shadow-glow)'
                }}
              >
                {node.name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

export const Globe: React.FC = () => {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing relative bg-radial-gradient">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <SceneController />
      </Canvas>
      
      {/* Decorative compass lines in the background */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 m-12 rounded-full opacity-10 flex items-center justify-center">
        <div className="w-4/5 h-4/5 border border-dashed border-white/10 rounded-full flex items-center justify-center">
          <div className="w-3/5 h-3/5 border border-white/5 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
export default Globe;

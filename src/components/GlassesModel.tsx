import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group, BoxGeometry, MeshStandardMaterial, CylinderGeometry } from "three";
import { FaceLandmarks } from "@/hooks/useFaceTracking";

interface GlassesModelProps {
  glassesType: string;
  landmarks: FaceLandmarks;
}

export const GlassesModel = ({ glassesType, landmarks }: GlassesModelProps) => {
  const groupRef = useRef<Group>(null);

  // Calculate glasses position and scale based on face landmarks
  const { position, rotation, scale } = useMemo(() => {
    if (!landmarks) return { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 };

    const leftEye = landmarks.leftEye;
    const rightEye = landmarks.rightEye;
    const noseTip = landmarks.noseTip;

    // Calculate center point between eyes
    const centerX = (leftEye.x + rightEye.x) / 2;
    const centerY = (leftEye.y + rightEye.y) / 2;
    const centerZ = (leftEye.z + rightEye.z) / 2;

    // Calculate eye distance for scaling
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + 
      Math.pow(rightEye.y - leftEye.y, 2)
    );

    // Convert normalized coordinates to 3D space
    // Note: We need to adjust the coordinate system
    const x = (centerX - 0.5) * 4; // Scale and center
    const y = -(centerY - 0.5) * 3; // Flip Y and scale
    const z = centerZ * 2 - 1; // Adjust Z depth

    // Calculate rotation based on eye alignment
    const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

    // Scale based on face size
    const glassesScale = eyeDistance * 8; // Adjust multiplier as needed

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [0, 0, -eyeAngle] as [number, number, number],
      scale: Math.max(0.5, Math.min(2, glassesScale)) // Clamp scale
    };
  }, [landmarks]);

  // Create different glasses models based on type
  const GlassesGeometry = () => {
    switch (glassesType) {
      case "aviator":
        return <AviatorGlasses />;
      case "wayfare":
        return <WayfarerGlasses />;
      case "round":
        return <RoundGlasses />;
      case "cat-eye":
        return <CatEyeGlasses />;
      default:
        return <AviatorGlasses />;
    }
  };

  return (
    <group 
      ref={groupRef} 
      position={position as [number, number, number]} 
      rotation={rotation as [number, number, number]} 
      scale={[scale, scale, scale]}
    >
      <GlassesGeometry />
    </group>
  );
};

// Aviator glasses component
const AviatorGlasses = () => {
  return (
    <group>
      {/* Left lens */}
      <mesh position={[-0.15, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.005, 32]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Right lens */}
      <mesh position={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.005, 32]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.04]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Left frame */}
      <mesh position={[-0.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.008, 32]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          metalness={0.8} 
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Right frame */}
      <mesh position={[0.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.008, 32]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          metalness={0.8} 
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// Wayfare glasses component
const WayfarerGlasses = () => {
  return (
    <group>
      {/* Left lens */}
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.16, 0.12, 0.005]} />
        <meshStandardMaterial 
          color="#2C2C2C" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Right lens */}
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.16, 0.12, 0.005]} />
        <meshStandardMaterial 
          color="#2C2C2C" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.02, 0.008]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Left frame */}
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.01]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Right frame */}
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.01]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// Round glasses component
const RoundGlasses = () => {
  return (
    <group>
      {/* Left lens */}
      <mesh position={[-0.13, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.005, 32]} />
        <meshStandardMaterial 
          color="#FFE4B5" 
          transparent 
          opacity={0.4}
        />
      </mesh>
      
      {/* Right lens */}
      <mesh position={[0.13, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.005, 32]} />
        <meshStandardMaterial 
          color="#FFE4B5" 
          transparent 
          opacity={0.4}
        />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.06]} />
        <meshStandardMaterial color="#DAA520" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Left frame */}
      <mesh position={[-0.13, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.008, 32]} />
        <meshStandardMaterial 
          color="#DAA520" 
          metalness={0.7} 
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Right frame */}
      <mesh position={[0.13, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.008, 32]} />
        <meshStandardMaterial 
          color="#DAA520" 
          metalness={0.7} 
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// Cat-eye glasses component  
const CatEyeGlasses = () => {
  return (
    <group>
      {/* Left lens - slightly tilted box for cat-eye shape */}
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.16, 0.1, 0.005]} />
        <meshStandardMaterial 
          color="#FF69B4" 
          transparent 
          opacity={0.4}
        />
      </mesh>
      
      {/* Right lens */}
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.16, 0.1, 0.005]} />
        <meshStandardMaterial 
          color="#FF69B4" 
          transparent 
          opacity={0.4}
        />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.03, 0.015, 0.008]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
      
      {/* Left frame */}
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.18, 0.12, 0.01]} />
        <meshStandardMaterial 
          color="#FFB6C1"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Right frame */}
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.18, 0.12, 0.01]} />
        <meshStandardMaterial 
          color="#FFB6C1"
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};
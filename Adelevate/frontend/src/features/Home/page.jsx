import React, { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  RoundedBox,
  Line,
  OrbitControls,
  Environment,
  PerspectiveCamera,
  Html,
  Ring,
  AdaptiveDpr,
  AdaptiveEvents
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Platform Imports
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// ============================================
// SVG ICON COMPONENTS
// ============================================

const IconAutomation = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const IconDashboard = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const IconSync = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

const IconArrowRight = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconPlay = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconMenu = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconClose = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Logo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="currentColor">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#00d4ff" />
      </linearGradient>
    </defs>
    <path
      d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
      fill="url(#logoGrad)"
    />
  </svg>
);

// ============================================
// 3D COMPONENTS
// ============================================

// Camera adjustment for different screen sizes
const ResponsiveCamera = () => {
  const { viewport } = useThree();
  const cameraRef = useRef();

  useEffect(() => {
    if (cameraRef.current) {
      // Adjust camera position based on viewport
      const isMobile = viewport.width < 6;
      const is4K = window.innerWidth >= 2560;

      if (is4K) {
        cameraRef.current.position.z = 7;
        cameraRef.current.fov = 55;
      } else if (isMobile) {
        cameraRef.current.position.z = 10;
        cameraRef.current.fov = 60;
      } else {
        cameraRef.current.position.z = 8;
        cameraRef.current.fov = 50;
      }
      cameraRef.current.updateProjectionMatrix();
    }
  }, [viewport]);

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={50} />;
};

const DashboardScreen = ({ position = [0, 0, 0] }) => {
  const groupRef = useRef();
  const barsRef = useRef([]);
  const barHeights = [0.3, 0.5, 0.4, 0.7, 0.55, 0.85, 0.6, 0.75];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const baseHeight = barHeights[i];
        bar.scale.y = baseHeight + Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.1;
      }
    });
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef} position={position}>
        <RoundedBox args={[4, 2.5, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial
            color="#0a0a0f"
            metalness={0.9}
            roughness={0.1}
            emissive="#0066ff"
            emissiveIntensity={0.05}
          />
        </RoundedBox>

        <RoundedBox args={[3.8, 2.3, 0.05]} radius={0.08} smoothness={4} position={[0, 0, 0.08]}>
          <meshStandardMaterial
            color="#0f1420"
            metalness={0.5}
            roughness={0.2}
            transparent
            opacity={0.95}
          />
        </RoundedBox>

        <group position={[-1.2, -0.3, 0.15]}>
          {barHeights.map((height, i) => (
            <mesh
              key={i}
              ref={(el) => (barsRef.current[i] = el)}
              position={[i * 0.35, height / 2, 0]}
            >
              <boxGeometry args={[0.2, 1, 0.1]} />
              <meshStandardMaterial
                color={`hsl(${200 + i * 8}, 80%, 55%)`}
                emissive={`hsl(${200 + i * 8}, 80%, 55%)`}
                emissiveIntensity={0.6}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          ))}
        </group>

        <group position={[1.2, 0.3, 0.15]}>
          <Ring args={[0.4, 0.5, 32]}>
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </Ring>
        </group>

        {[-0.8, -0.3, 0.2, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 0.9, 0.15]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color={i === 1 ? "#ff4444" : "#00ff88"}
              emissive={i === 1 ? "#ff4444" : "#00ff88"}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}

        <pointLight position={[0, 0, 1]} intensity={0.5} color="#0066ff" distance={3} />
      </group>
    </Float>
  );
};

const PlatformCard = ({ position, platformName, color, icon, delay = 0 }) => {
  const cardRef = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.15;
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.1;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group
      ref={cardRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={glowRef}>
        <ringGeometry args={[0.55, 0.65, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={ringRef}>
        <torusGeometry args={[0.5, 0.02, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#0a0a15"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.85}
          envMapIntensity={1}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.15 : 0.05}
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh position={[0, 0, 0.35]}>
        <circleGeometry args={[0.28, 64]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.3} />
      </mesh>

      <Html
        position={[0, 0, 0.36]}
        center
        transform
        sprite
        distanceFactor={6}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <img
            src={icon}
            alt={platformName}
            style={{
              width: "36px",
              height: "36px",
              objectFit: "contain",
              filter: hovered ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" : "none",
              transition: "filter 0.3s ease"
            }}
          />
        </div>
      </Html>

      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI * 2) / 4;
        const x = Math.cos(angle) * 0.52;
        const y = Math.sin(angle) * 0.52;
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </mesh>
        );
      })}

      <Line
        points={[
          [0, 0, 0],
          [-position[0] * 0.5, -position[1] * 0.5, -position[2] * 0.5]
        ]}
        color={color}
        lineWidth={2}
        transparent
        opacity={hovered ? 0.7 : 0.3}
      />

      {hovered && (
        <>
          <pointLight position={[0, 0, 0.5]} intensity={3} color={color} distance={3} />
          <mesh>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.15}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

const DataFlowBeam = ({ start, end, color }) => {
  const particleRef = useRef();
  const particleRef2 = useRef();
  const particleRef3 = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (particleRef.current) {
      const t = (time * 0.4) % 1;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...start),
        new THREE.Vector3(
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 + 0.5,
          (start[2] + end[2]) / 2
        ),
        new THREE.Vector3(...end)
      );
      const point = curve.getPoint(t);
      particleRef.current.position.copy(point);
    }
    if (particleRef2.current) {
      const t = (time * 0.4 + 0.33) % 1;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...start),
        new THREE.Vector3(
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 + 0.5,
          (start[2] + end[2]) / 2
        ),
        new THREE.Vector3(...end)
      );
      const point = curve.getPoint(t);
      particleRef2.current.position.copy(point);
    }
    if (particleRef3.current) {
      const t = (time * 0.4 + 0.66) % 1;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...start),
        new THREE.Vector3(
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 + 0.5,
          (start[2] + end[2]) / 2
        ),
        new THREE.Vector3(...end)
      );
      const point = curve.getPoint(t);
      particleRef3.current.position.copy(point);
    }
  });

  const midPoint = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + 0.5,
    (start[2] + end[2]) / 2
  ];

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    new THREE.Vector3(...midPoint),
    new THREE.Vector3(...end)
  );

  return (
    <group>
      <Line points={curve.getPoints(50)} color={color} lineWidth={1.5} transparent opacity={0.15} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      <mesh ref={particleRef2}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={particleRef3}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
};

const AutomationEngine = ({ position = [0, 0, 0] }) => {
  const outerRingRef = useRef();
  const middleRingRef = useRef();
  const innerRingRef = useRef();
  const coreRef = useRef();
  const pulseRef = useRef();
  const orbitRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = time * 0.2;
      outerRingRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.z = -time * 0.3;
      middleRingRef.current.rotation.y = time * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = time * 0.5;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.4;
      coreRef.current.rotation.x = Math.sin(time) * 0.2;
    }
    if (pulseRef.current) {
      const scale = 1 + Math.sin(time * 3) * 0.1;
      pulseRef.current.scale.set(scale, scale, scale);
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
      <group position={position}>
        <mesh ref={outerRingRef}>
          <torusGeometry args={[1.4, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#0066ff"
            emissive="#0066ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.5}
          />
        </mesh>

        <mesh ref={middleRingRef}>
          <torusGeometry args={[1.1, 0.025, 16, 64]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>

        <mesh ref={innerRingRef}>
          <torusGeometry args={[0.8, 0.03, 16, 64]} />
          <meshStandardMaterial
            color="#0088ff"
            emissive="#0088ff"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>

        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.5, 2]} />
          <meshStandardMaterial
            color="#0066ff"
            emissive="#0066ff"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
            wireframe
          />
        </mesh>

        <mesh>
          <icosahedronGeometry args={[0.35, 1]} />
          <meshStandardMaterial
            color="#001133"
            emissive="#0066ff"
            emissiveIntensity={0.2}
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>

        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color="#0066ff"
            emissive="#0066ff"
            emissiveIntensity={0.3}
            transparent
            opacity={0.1}
          />
        </mesh>

        <group ref={orbitRef}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            const radius = 0.7;
            return (
              <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1} />
              </mesh>
            );
          })}
        </group>

        <pointLight position={[0, 0, 0]} intensity={2} color="#0066ff" distance={5} />
      </group>
    </Float>
  );
};

const RuleNode = ({ position, active = true, delay = 0 }) => {
  const nodeRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.1;
      nodeRef.current.rotation.y = state.clock.elapsedTime;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group ref={nodeRef} position={position}>
      <mesh>
        <octahedronGeometry args={[0.12]} />
        <meshStandardMaterial
          color={active ? "#00ff88" : "#ff4444"}
          emissive={active ? "#00ff88" : "#ff4444"}
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.18, 0.01, 8, 32]} />
        <meshStandardMaterial
          color={active ? "#00ff88" : "#ff4444"}
          emissive={active ? "#00ff88" : "#ff4444"}
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

const BackgroundParticles = () => {
  const particlesRef = useRef();
  const count = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#0066ff" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};

const AdelevateScene = () => {
  const platforms = [
    { position: [-2.8, 1.5, -1], name: "Facebook", color: "#1877f2", icon: fb, delay: 0 },
    { position: [2.8, 1.8, -0.5], name: "Google", color: "#ea4335", icon: googleIcon, delay: 0.8 },
    { position: [3, -0.5, -1.5], name: "TikTok", color: "#00f2ea", icon: tiktokIcon, delay: 1.6 },
    {
      position: [-2.5, -1, -1],
      name: "Snapchat",
      color: "#fffc00",
      icon: snapchatIcon,
      delay: 2.4
    },
    { position: [0, 2.5, -2], name: "NewsBreak", color: "#ff3333", icon: nb, delay: 3.2 }
  ];

  return (
    <>
      <ResponsiveCamera />

      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#0066ff" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#00d4ff" />
      <pointLight position={[0, -5, 5]} intensity={0.3} color="#0088ff" />
      <spotLight position={[0, 8, 4]} angle={0.4} penumbra={1} intensity={1} color="#ffffff" />

      <BackgroundParticles />
      <AutomationEngine position={[0, 0, -1]} />
      <DashboardScreen position={[0, -2.2, 0]} />

      {platforms.map((platform) => (
        <PlatformCard
          key={platform.name}
          position={platform.position}
          platformName={platform.name}
          color={platform.color}
          icon={platform.icon}
          delay={platform.delay}
        />
      ))}

      {platforms.map((platform, i) => (
        <DataFlowBeam
          key={`beam-${i}`}
          start={platform.position}
          end={[0, 0, -1]}
          color={platform.color}
        />
      ))}

      <RuleNode position={[-0.8, 0.5, 0]} active={true} delay={0} />
      <RuleNode position={[0.8, 0.6, 0]} active={true} delay={0.5} />
      <RuleNode position={[0, -0.5, 0.5]} active={true} delay={1} />
      <RuleNode position={[-0.5, -0.3, 0.3]} active={false} delay={1.5} />
      <RuleNode position={[0.6, 0, 0.4]} active={true} delay={2} />

      <Environment preset="night" />

      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
      </EffectComposer>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />

      {/* Adaptive performance for high DPI screens */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
};

// ============================================
// PLATFORM DATA
// ============================================

const platformImages = [
  { name: "Facebook", icon: fb, color: "#1877f2" },
  { name: "Google", icon: googleIcon, color: "#ea4335" },
  { name: "TikTok", icon: tiktokIcon, color: "#00f2ea" },
  { name: "Snapchat", icon: snapchatIcon, color: "#fffc00" },
  { name: "NewsBreak", icon: nb, color: "#ff3333" }
];

// ============================================
// UI COMPONENTS
// ============================================

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#features" }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/90 backdrop-blur-2xl border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <span className="text-white text-xl font-bold">Adelevate</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-4 py-3 text-white/60 hover:text-white rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="px-4 pt-4 space-y-3 border-t border-white/5">
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);
  const [canvasHeight, setCanvasHeight] = useState("650px");

  // Adjust canvas size for different screen resolutions
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      if (width >= 3840) {
        // 4K
        setCanvasHeight("900px");
      } else if (width >= 2560) {
        // 2K/QHD
        setCanvasHeight("800px");
      } else if (width >= 1920) {
        // Full HD
        setCanvasHeight("700px");
      } else {
        setCanvasHeight("650px");
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 102, 255, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 102, 255, 1) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px"
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />

      <div className="relative z-10 w-full max-w-[1920px] 4xl:max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          <motion.div style={{ opacity, y }}>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white mb-6 leading-[1.1]"
            >
              <span className="block">Adelevate</span>
             
            </motion.h1>

            {/* <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-lg xl:text-xl 2xl:text-2xl text-white/50 mb-8 leading-relaxed max-w-lg xl:max-w-xl"
            >
              Unite your ad campaigns across all major platforms into one intelligent command
              center.
            </motion.p> */}

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:block"
            style={{ height: canvasHeight }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent blur-3xl" />

            <Canvas
              dpr={[1, Math.min(window.devicePixelRatio, 2)]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
              }}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0
              }}
            >
              <Suspense fallback={null}>
                <AdelevateScene />
              </Suspense>
            </Canvas>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PlatformsSection = () => {
  return (
    <section id="platform" className="py-20 xl:py-28 2xl:py-32 bg-black/50">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12 xl:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-3">
            All Your Platforms, One Dashboard
          </h2>
          <p className="text-white/50 max-w-xl xl:max-w-2xl mx-auto xl:text-lg 2xl:text-xl">
            Manage all your advertising platforms from one centralized location
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6">
          {platformImages.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="group p-6 xl:p-8 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all text-center cursor-pointer"
              style={{
                boxShadow: `0 0 20px ${platform.color}10`
              }}
            >
              <div
                className="w-16 h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all"
                style={{
                  boxShadow: `0 0 30px ${platform.color}30`
                }}
              >
                <img
                  src={platform.icon}
                  alt={platform.name}
                  className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-white/80 text-sm xl:text-base 2xl:text-lg font-medium group-hover:text-white transition-colors">
                {platform.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="group p-6 xl:p-8 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all"
  >
    <div
      className={`w-12 h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 mb-4 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
    >
      <Icon className="w-6 h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 text-white" />
    </div>
    <h3 className="text-lg xl:text-xl 2xl:text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-white/50 text-sm xl:text-base 2xl:text-lg leading-relaxed">{description}</p>
  </motion.div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: IconAutomation,
      title: "Smart Automation",
      description:
        "Auto-optimize campaigns, adjust bids, and pause underperformers based on real-time data.",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: IconDashboard,
      title: "Unified Analytics",
      description: "Aggregate data from all platforms into one dashboard with real-time insights.",
      gradient: "from-cyan-600 to-blue-600"
    },
    {
      icon: IconSync,
      title: "Multi-Platform Sync",
      description: "Execute bulk changes across all platforms. Coordinate launches effortlessly.",
      gradient: "from-purple-600 to-blue-600"
    }
  ];

  return (
    <section id="features" className="py-20 xl:py-28 2xl:py-32 bg-black">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const App = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <PlatformsSection />
      </main>
    </div>
  );
};

export default App;

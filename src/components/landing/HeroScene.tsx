"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Environment } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

function SceneContent() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
      tl.to(camera.position, { z: 3, y: 1.5, ease: "none" })
        .to(meshRef.current.rotation, { y: Math.PI * 0.5, ease: "none" }, "<")
        .to(meshRef.current.scale, { x: 0.6, y: 0.6, z: 0.6, ease: "none" }, "<");
    });
    return () => ctx.revert();
  }, [camera]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.002;
    meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.4, 4]} />
      <MeshDistortMaterial
        color="#6366f1"
        distort={0.35}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <Canvas
      className="absolute inset-0 w-full h-full"
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="city" />
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <SceneContent />
      </Float>
    </Canvas>
  );
}

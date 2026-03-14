"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

/* -----------------------------
SERVER NODE
----------------------------- */

function ServerNode({ position, cpu }: any) {

  const ref = useRef<any>(null);

  let color = "#22c55e";

  if (cpu > 80) color = "#ef4444";
  else if (cpu > 60) color = "#eab308";

  useFrame(({ clock }) => {

    const pulse = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;

    if (ref.current) {
      ref.current.scale.set(pulse, pulse, pulse);
      ref.current.rotation.y += 0.003;
    }

  });

  return (
    <Sphere ref={ref} args={[0.35, 32, 32]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        metalness={0.3}
        roughness={0.2}
      />
    </Sphere>
  );
}

/* -----------------------------
CONNECTION
----------------------------- */

function Connection({ start, end }: any) {

  return (
    <Line
      points={[start, end]}
      color="#0ea5e9"
      lineWidth={2}
      transparent
      opacity={0.7}
    />
  );
}

/* -----------------------------
DATA PACKET
----------------------------- */

function DataPacket({ start, end, speed }: any) {

  const ref = useRef<any>(null);
  const progress = useRef(Math.random());

  useFrame(() => {

    progress.current += speed;

    if (progress.current > 1) progress.current = 0;

    const p = progress.current;

    const x = THREE.MathUtils.lerp(start[0], end[0], p);
    const y = THREE.MathUtils.lerp(start[1], end[1], p);
    const z = THREE.MathUtils.lerp(start[2], end[2], p);

    if (ref.current) {
      ref.current.position.set(x, y, z);
    }

  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.09, 16, 16]} />
      <meshStandardMaterial
        color="#0ea5e9"
        emissive="#0ea5e9"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

/* -----------------------------
MAIN TOPOLOGY
----------------------------- */

export default function TopologyMap({ metrics = [] }: any) {

  const cpu = metrics?.[metrics.length - 1]?.cpu ?? 20;

  const servers = [
    { pos: [-4, 0, 0], cpu },
    { pos: [-2, 1.5, 0], cpu: cpu * 0.8 },
    { pos: [0, 0, 0], cpu },
    { pos: [2, 1.5, 0], cpu: cpu * 0.6 },
    { pos: [4, 0, 0], cpu: cpu * 0.7 },
    { pos: [-1, -2, 0], cpu: cpu * 0.9 },
    { pos: [1, -2, 0], cpu: cpu * 0.5 }
  ];

  const connections = [
    [servers[0].pos, servers[1].pos],
    [servers[1].pos, servers[2].pos],
    [servers[2].pos, servers[3].pos],
    [servers[3].pos, servers[4].pos],
    [servers[2].pos, servers[5].pos],
    [servers[2].pos, servers[6].pos]
  ];

  return (

    <div className="chart-card">

      <h2 className="text-xl font-semibold mb-4 text-[var(--text)]">
        Infrastructure Topology
      </h2>

      <div style={{ height: "450px" }} className="rounded-lg overflow-hidden border border-[var(--border)]">

        <Canvas
          camera={{ position: [0, 2, 8] }}
          style={{ background: "transparent" }}
        >

          {/* Lighting */}

          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />

          {/* Servers */}

          {servers.map((s, i) => (
            <ServerNode key={i} position={s.pos} cpu={s.cpu} />
          ))}

          {/* Connections */}

          {connections.map((c, i) => (
            <Connection key={i} start={c[0]} end={c[1]} />
          ))}

          {/* Packets */}

          {connections.map((c, i) => (
            <group key={"p" + i}>
              <DataPacket start={c[0]} end={c[1]} speed={0.003} />
              <DataPacket start={c[1]} end={c[0]} speed={0.0025} />
            </group>
          ))}

          <OrbitControls enableZoom enablePan enableRotate />

        </Canvas>

      </div>

    </div>

  );
}
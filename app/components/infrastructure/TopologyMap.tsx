"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Sphere, Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type Server = {
  id: string;
  name: string;
  pos: Vec3;
  cpu: number;
};

/* -----------------------------
SERVER NODE
----------------------------- */

function ServerNode({ position, cpu }: { position: Vec3; cpu: number }) {

  const ref = useRef<THREE.Mesh | null>(null);
  const [hovered, setHovered] = useState(false);

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
    <Sphere
      ref={ref}
      args={[0.35, 32, 32]}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        metalness={0.3}
        roughness={0.2}
      />
      {hovered && (
        <Html distanceFactor={8} position={[0, 0.65, 0]}>
          <div className="px-2 py-1 text-xs rounded bg-black/80 text-white border border-white/20 whitespace-nowrap">
            CPU: {Math.round(cpu)}%
          </div>
        </Html>
      )}
    </Sphere>
  );
}

/* -----------------------------
CONNECTION
----------------------------- */

function Connection({ start, end }: { start: Vec3; end: Vec3 }) {

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

function DataPacket({ start, end, speed }: { start: Vec3; end: Vec3; speed: number }) {

  const ref = useRef<THREE.Mesh | null>(null);
  const progress = useRef(0);

  useEffect(() => {
    progress.current = Math.random();
  }, []);

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

export default function TopologyMap({ metrics = [] }: { metrics?: Array<{ cpu?: number }> }) {

  const cpu = metrics?.[metrics.length - 1]?.cpu ?? 20;

  const servers: Server[] = [
    { id: "edge-gw", name: "Edge Gateway", pos: [-4, 0, 0], cpu },
    { id: "auth", name: "Auth Service", pos: [-2, 1.5, 0], cpu: cpu * 0.8 },
    { id: "core", name: "Core API", pos: [0, 0, 0], cpu },
    { id: "worker", name: "Worker Queue", pos: [2, 1.5, 0], cpu: cpu * 0.6 },
    { id: "storage", name: "Storage", pos: [4, 0, 0], cpu: cpu * 0.7 },
    { id: "db-primary", name: "DB Primary", pos: [-1, -2, 0], cpu: cpu * 0.9 },
    { id: "cache", name: "Cache", pos: [1, -2, 0], cpu: cpu * 0.5 }
  ];

  const connections: [Vec3, Vec3][] = [
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

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[var(--text-muted)]">
        {servers.map((server) => (
          <div
            key={server.id}
            className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
              <span className="text-[var(--text)]">{server.name}</span>
            </div>
            <span>{Math.round(server.cpu)}% CPU</span>
          </div>
        ))}
      </div>

    </div>

  );
}

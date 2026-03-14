"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

/* -----------------------------
SERVER NODE WITH HEAT + ANOMALY
----------------------------- */

function ServerNode({ position, cpu }: any) {

  const ref = useRef<any>(null);

  let color = "#22c55e";

  if (cpu > 80) color = "#ef4444";
  else if (cpu > 60) color = "#eab308";

  useFrame(({ clock }) => {

    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2) * 0.05;

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
        emissiveIntensity={cpu > 80 ? 2 : 0.8}
        roughness={0.2}
        metalness={0.4}
      />
    </Sphere>
  );
}

/* -----------------------------
CONNECTION LINE
----------------------------- */

function Connection({ start, end }: any) {

  return (
    <Line
      points={[start, end]}
      color="#38bdf8"
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

/* -----------------------------
DATA PACKET FLOW
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
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshStandardMaterial
        color="#38bdf8"
        emissive="#38bdf8"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

/* -----------------------------
MAIN TOPOLOGY MAP
----------------------------- */

export default function TopologyMap({ metrics = [] }: any) {

  const cpu = metrics?.[metrics.length - 1]?.cpu ?? 20;

  const servers = [
    { pos: [-4, 0, 0], cpu },
    { pos: [-2, 1.5, 0], cpu: cpu * 0.8 },
    { pos: [0, 0, 0], cpu: cpu },
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

    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">

      <h2 className="text-xl mb-4 text-white">
        Infrastructure Topology
      </h2>

      <div style={{ height: "450px" }}>

        <Canvas camera={{ position: [0, 2, 8] }}>

          {/* LIGHTING */}

          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* SERVERS */}

          {servers.map((s, i) => (
            <ServerNode key={i} position={s.pos} cpu={s.cpu} />
          ))}

          {/* CONNECTIONS */}

          {connections.map((c, i) => (
            <Connection key={i} start={c[0]} end={c[1]} />
          ))}

          {/* PACKET STREAMS */}

          {connections.map((c, i) => (
            <group key={"packet-group-" + i}>
              <DataPacket start={c[0]} end={c[1]} speed={0.003} />
              <DataPacket start={c[1]} end={c[0]} speed={0.0025} />
              <DataPacket start={c[0]} end={c[1]} speed={0.002} />
            </group>
          ))}

          <OrbitControls enableZoom enablePan enableRotate />

        </Canvas>

      </div>

    </div>

  );
}
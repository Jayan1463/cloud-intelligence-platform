"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

/* -----------------------------
SERVER NODE WITH PULSING GLOW
----------------------------- */

function ServerNode({ position }: any) {

  const ref = useRef<any>(null);

  const cpu = Math.random() * 100;

  let color = "#22c55e";

  if (cpu > 80) color = "#ef4444";
  else if (cpu > 50) color = "#eab308";

  useFrame(({ clock }) => {

    const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;

    if (ref.current) {
      ref.current.scale.set(scale, scale, scale);
    }

  });

  return (
    <Sphere ref={ref} args={[0.35, 32, 32]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.3}
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
    />
  );
}

/* -----------------------------
SMOOTH PACKET FLOW
----------------------------- */

function DataPacket({ start, end }: any) {

  const ref = useRef<any>(null);
  const progress = useRef(Math.random());

  useFrame(() => {

    progress.current += 0.003;

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
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#38bdf8"
        emissive="#38bdf8"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

/* -----------------------------
TOPOLOGY MAP
----------------------------- */

export default function TopologyMap() {

  const servers = [
    [-4, 0, 0],
    [-2, 1.5, 0],
    [0, 0, 0],
    [2, 1.5, 0],
    [4, 0, 0],
    [-1, -2, 0],
    [1, -2, 0]
  ];

  const connections = [
    [servers[0], servers[1]],
    [servers[1], servers[2]],
    [servers[2], servers[3]],
    [servers[3], servers[4]],
    [servers[2], servers[5]],
    [servers[2], servers[6]]
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

          <pointLight position={[10, 10, 10]} intensity={1} />

          {/* SERVERS */}

          {servers.map((pos, i) => (
            <ServerNode key={i} position={pos} />
          ))}

          {/* CONNECTIONS */}

          {connections.map((c, i) => (
            <Connection key={i} start={c[0]} end={c[1]} />
          ))}

          {/* PACKETS FLOWING */}

          {connections.map((c, i) => (
            <>
              <DataPacket key={"p1"+i} start={c[0]} end={c[1]} />
              <DataPacket key={"p2"+i} start={c[1]} end={c[0]} />
            </>
          ))}

          <OrbitControls enableZoom enablePan enableRotate />

        </Canvas>

      </div>

    </div>

  );
}
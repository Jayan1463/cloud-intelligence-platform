"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Sphere } from "@react-three/drei";
import { useRef } from "react";

function ServerNode({ position }: any) {

  const cpu = Math.random() * 100;

  let color = "green";

  if (cpu > 80) color = "red";
  else if (cpu > 50) color = "yellow";

  return (
    <Sphere args={[0.35, 32, 32]} position={position}>
      <meshStandardMaterial color={color} emissive={color} />
    </Sphere>
  );
}

function Connection({ start, end }: any) {
  return (
    <Line points={[start, end]} color="cyan" lineWidth={2} />
  );
}

function DataPacket({ start, end }: any) {
  const ref = useRef<any>(null);
  let progress = 0;

  useFrame(() => {
    progress += 0.01;
    if (progress > 1) progress = 0;

    const x = start[0] + (end[0] - start[0]) * progress;
    const y = start[1] + (end[1] - start[1]) * progress;
    const z = start[2] + (end[2] - start[2]) * progress;

    if (ref.current) {
      ref.current.position.set(x, y, z);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="yellow" emissive="orange" />
    </mesh>
  );
}

export default function TopologyMap() {

  const servers = [
    [-3, 0, 0],
    [-1, 1, 0],
    [1, 0, 0],
    [3, 1, 0],
    [0, -2, 0]
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">

      <h2 className="text-xl mb-4 text-white">
        Infrastructure Topology
      </h2>

      <div style={{ height: "450px" }}>

        <Canvas camera={{ position: [0, 0, 6] }}>

          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />

          {servers.map((pos, i) => (
            <ServerNode key={i} position={pos} />
          ))}

          <Connection start={servers[0]} end={servers[1]} />
          <Connection start={servers[1]} end={servers[2]} />
          <Connection start={servers[2]} end={servers[3]} />
          <Connection start={servers[1]} end={servers[4]} />

          {/* Animated packets */}

          <DataPacket start={servers[0]} end={servers[1]} />
          <DataPacket start={servers[1]} end={servers[2]} />
          <DataPacket start={servers[2]} end={servers[3]} />
          <DataPacket start={servers[1]} end={servers[4]} />

          <OrbitControls />

        </Canvas>

      </div>

    </div>
  );
}
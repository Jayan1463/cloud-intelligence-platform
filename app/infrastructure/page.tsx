"use client";

import Sidebar from "../components/ui/Sidebar";
import TopologyMap from "../components/infrastructure/TopologyMap";

export default function Infrastructure() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-10">
          Infrastructure Topology
        </h1>

        <TopologyMap />

      </main>
    </div>
  );
}
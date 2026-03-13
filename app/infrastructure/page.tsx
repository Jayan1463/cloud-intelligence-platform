"use client";

import Sidebar from "../components/ui/Sidebar";
import TopologyMap from "../components/infrastructure/TopologyMap";

export default function InfrastructurePage() {
  return (
    <div className="flex">

      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-10">
          Infrastructure Overview
        </h1>

        <p className="text-zinc-400 mb-10">
          Visual representation of servers, databases, and network connections.
        </p>

        <TopologyMap />

      </main>

    </div>
  );
}
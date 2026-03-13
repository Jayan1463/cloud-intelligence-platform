"use client";

import Sidebar from "../components/ui/Sidebar";
import CPUChart from "../components/charts/CPUChart";
import MemoryChart from "../components/charts/MemoryChart";
import NetworkChart from "../components/charts/NetworkChart";

export default function AnalyticsPage() {

  // Dummy analytics data for now
  const demoMetrics = [
    { cpu: 45, memory: 60, network: 80 },
    { cpu: 70, memory: 55, network: 110 },
    { cpu: 30, memory: 40, network: 60 },
    { cpu: 90, memory: 80, network: 150 },
    { cpu: 65, memory: 50, network: 95 }
  ];

  return (

    <div className="flex">

      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-10">
          Infrastructure Analytics
        </h1>

        <p className="text-zinc-400 mb-10">
          Historical performance metrics and resource usage trends.
        </p>

        <div className="space-y-10">

          <CPUChart data={demoMetrics} />
          <MemoryChart data={demoMetrics} />
          <NetworkChart data={demoMetrics} />

        </div>

      </main>

    </div>

  );
}
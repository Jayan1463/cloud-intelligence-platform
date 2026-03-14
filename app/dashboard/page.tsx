"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { predictCost } from "../lib/costPrediction";
import { detectAnomaly } from "../lib/anomalyDetection";

import Sidebar from "../components/ui/Sidebar";
import ThemeToggle from "../components/ui/ThemeToggle";

import CPUChart from "../components/charts/CPUChart";
import MemoryChart from "../components/charts/MemoryChart";
import NetworkChart from "../components/charts/NetworkChart";
import CostChart from "../components/charts/CostChart";

import CPUHeatmap from "../components/infrastructure/CPUHeatmap";
import TopologyMap from "../components/infrastructure/TopologyMap";

type Metric = {
  cpu?: number;
  memory?: number;
  network?: number;
};

export default function Dashboard() {

  const router = useRouter();
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });

    const unsubscribeMetrics = onSnapshot(
      collection(db, "metrics"),
      (snapshot) => {

        const data = snapshot.docs.map(doc => doc.data() as Metric);
        const latest = data.slice(-30);

        setMetrics(latest);

      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeMetrics();
    };

  }, [router]);

  // ---------- Analytics ----------

  const avgCPU =
    metrics.length > 0
      ? Math.round(metrics.reduce((a, b) => a + (b.cpu ?? 0), 0) / metrics.length)
      : 0;

  const avgMemory =
    metrics.length > 0
      ? Math.round(metrics.reduce((a, b) => a + (b.memory ?? 0), 0) / metrics.length)
      : 0;

  const avgNetwork =
    metrics.length > 0
      ? Math.round(metrics.reduce((a, b) => a + (b.network ?? 0), 0) / metrics.length)
      : 0;

  const predictedCost = predictCost(metrics);

  const anomalyDetected = detectAnomaly(metrics);

  return (

    <div className="flex bg-gray-50 dark:bg-black text-gray-900 dark:text-white">

      <Sidebar />

      <main className="flex-1 min-h-screen p-10">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <h1 className="text-4xl font-bold">
            Cloud Infrastructure Dashboard
          </h1>

          <ThemeToggle />

        </div>

        {/* ANOMALY ALERT */}

        {anomalyDetected && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-400 dark:border-red-500 text-red-700 dark:text-white p-4 rounded-lg mb-6 animate-pulse">
            ⚠ AI detected abnormal infrastructure behaviour
          </div>
        )}

        {/* COST CARD */}

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm p-6 mb-10">

          <p className="text-gray-500 dark:text-zinc-400 mb-2">
            Estimated Monthly Cloud Cost
          </p>

          <p className="text-4xl font-bold">
            ${predictedCost}
          </p>

          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
            Based on current CPU, memory and network usage
          </p>

        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl p-6">
            <p className="text-gray-500 dark:text-zinc-400">Average CPU Usage</p>
            <p className="text-3xl font-bold">{avgCPU}%</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl p-6">
            <p className="text-gray-500 dark:text-zinc-400">Average Memory Usage</p>
            <p className="text-3xl font-bold">{avgMemory}%</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl p-6">
            <p className="text-gray-500 dark:text-zinc-400">Average Network Traffic</p>
            <p className="text-3xl font-bold">{avgNetwork} Mbps</p>
          </div>

        </div>

        {/* CPU HEATMAP */}

        <CPUHeatmap metrics={metrics} />

        {/* LIVE METRIC CARDS */}

        <div className="grid grid-cols-3 gap-6 mb-12">

          {metrics.slice(-3).map((m, i) => (

            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm p-6 rounded-xl hover:border-blue-500 transition-all"
            >

              <p>CPU Usage: {m.cpu ?? 0}%</p>
              <p>Memory Usage: {m.memory ?? 0}%</p>
              <p>Network Traffic: {m.network ?? 0} Mbps</p>

            </div>

          ))}

        </div>

        {/* COST TREND GRAPH */}

        <div className="mb-12">
          <CostChart data={metrics} />
        </div>

        {/* LIVE CHARTS */}

        <div className="space-y-10">

          <CPUChart data={metrics} />
          <MemoryChart data={metrics} />
          <NetworkChart data={metrics} />

        </div>

        {/* INFRASTRUCTURE MAP */}

        <div className="mt-12">
          <TopologyMap metrics={metrics} />
        </div>

      </main>

    </div>

  );
}
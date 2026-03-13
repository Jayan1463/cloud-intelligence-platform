"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { predictCost } from "../lib/costPrediction";

import Sidebar from "../components/ui/Sidebar";
import CPUChart from "../components/charts/CPUChart";
import MemoryChart from "../components/charts/MemoryChart";
import NetworkChart from "../components/charts/NetworkChart";
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

    // -------- Authentication Check --------
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {

      if (!user) {
        router.push("/login");
      }

    });

    // -------- Firebase Metrics Listener --------
    const unsubscribe = onSnapshot(
      collection(db, "metrics"),
      (snapshot) => {

        const data = snapshot.docs.map(doc => doc.data() as Metric);
        setMetrics(data);

      }
    );

    // ---- Simulate live infrastructure metrics ----
    const interval = setInterval(async () => {

      await addDoc(collection(db, "metrics"), {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 200)
      });

    }, 5000);

    return () => {
      unsubscribe();
      unsubscribeAuth();
      clearInterval(interval);
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

  // ---------- AI Cost Prediction ----------
  const predictedCost = predictCost(metrics);

  // ---------- Anomaly Detection ----------
  const anomalyDetected =
    metrics.some(m => (m.cpu ?? 0) > 85 || (m.memory ?? 0) > 90);

  return (

    <div className="flex">

      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-10">
          Cloud Infrastructure Dashboard
        </h1>

        {anomalyDetected && (
          <div className="bg-red-900 border border-red-500 p-4 rounded-lg mb-6">
            ⚠ Infrastructure anomaly detected (high CPU or memory usage)
          </div>
        )}

        {/* -------- Cost Prediction -------- */}

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-10">

          <p className="text-zinc-400 mb-2">
            Estimated Monthly Cloud Cost
          </p>

          <p className="text-4xl font-bold">
            ${predictedCost}
          </p>

          <p className="text-sm text-zinc-500 mt-2">
            Based on current CPU, memory and network usage
          </p>

        </div>

        {/* -------- Summary Metrics -------- */}

        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
            <p className="text-zinc-400">Average CPU Usage</p>
            <p className="text-3xl font-bold">{avgCPU}%</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
            <p className="text-zinc-400">Average Memory Usage</p>
            <p className="text-3xl font-bold">{avgMemory}%</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
            <p className="text-zinc-400">Average Network Traffic</p>
            <p className="text-3xl font-bold">{avgNetwork} Mbps</p>
          </div>

        </div>

        {/* -------- Metric Cards -------- */}

        <div className="grid grid-cols-3 gap-6 mb-12">

          {metrics.slice(-3).map((m, i) => (

            <div
              key={i}
              className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 p-6 rounded-xl hover:border-blue-500 transition-all"
            >

              <p>CPU Usage: {m.cpu ?? 0}%</p>
              <p>Memory Usage: {m.memory ?? 0}%</p>
              <p>Network Traffic: {m.network ?? 0} Mbps</p>

            </div>

          ))}

        </div>

        {/* -------- Charts -------- */}

        <div className="space-y-10">

          <CPUChart data={metrics} />
          <MemoryChart data={metrics} />
          <NetworkChart data={metrics} />

        </div>

        {/* -------- Infrastructure Map -------- */}

        <div className="mt-12">
          <TopologyMap />
        </div>

      </main>

    </div>

  );
}
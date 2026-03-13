"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/ui/Sidebar";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { predictCost } from "../lib/costPrediction";

type Metric = {
  cpu?: number;
  memory?: number;
  network?: number;
};

export default function CostPage() {

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [predictedCost, setPredictedCost] = useState(0);

  useEffect(() => {

    const unsubscribe = onSnapshot(
      collection(db, "metrics"),
      (snapshot) => {

        const data = snapshot.docs.map(doc => doc.data() as Metric);
        setMetrics(data);

        const cost = predictCost(data);
        setPredictedCost(cost);

      }
    );

    return () => unsubscribe();

  }, []);

  return (

    <div className="flex">

      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-10">
          AI Cloud Cost Intelligence
        </h1>

        <p className="text-zinc-400 mb-10">
          Predicts infrastructure cost based on CPU, memory and network usage.
        </p>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8">

          <p className="text-zinc-400 mb-2">
            Estimated Monthly Cost
          </p>

          <p className="text-5xl font-bold text-green-400">
            ${predictedCost}
          </p>

          <p className="text-sm text-zinc-500 mt-3">
            AI prediction based on infrastructure metrics
          </p>

        </div>

      </main>

    </div>

  );
}
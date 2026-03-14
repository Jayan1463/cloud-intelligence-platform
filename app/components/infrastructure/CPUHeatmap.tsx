"use client";

type Metric = {
  cpu?: number;
};

export default function CPUHeatmap({ metrics }: { metrics: Metric[] }) {

  // use last 9 metrics as server nodes
  const nodes = metrics.slice(-9);

  return (

    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-10">

      <h2 className="text-xl font-semibold mb-6">
        Server CPU Heatmap
      </h2>

      <div className="grid grid-cols-3 gap-4">

        {nodes.map((m, i) => {

          const cpu = m.cpu ?? 0;

          let color = "bg-green-500";

          if (cpu > 75) color = "bg-red-500";
          else if (cpu > 40) color = "bg-yellow-400";

          return (

            <div
              key={i}
              className={`${color} h-20 rounded-lg flex flex-col items-center justify-center text-black font-bold shadow-md`}
            >

              <span className="text-lg">
                {cpu}%
              </span>

              <span className="text-xs">
                Server {i + 1}
              </span>

            </div>

          );

        })}

      </div>

    </div>

  );
}
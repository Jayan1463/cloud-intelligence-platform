"use client";

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid
} from "recharts";

type Metric = {
cpu?: number;
memory?: number;
network?: number;
};

export default function CostChart({ data }: { data: Metric[] }) {

const chartData = data.map((m,i)=>{

const cpu = m.cpu ?? 0;
const memory = m.memory ?? 0;
const network = m.network ?? 0;

const cost =
cpu * 0.02 +
memory * 0.015 +
network * 0.01;

return {
time:i+1,
cost:Number(cost.toFixed(2))
};

});

return (

<div className="chart-card">

<h2 className="text-xl font-semibold mb-4 text-[var(--text)]">
Cost Prediction Trend
</h2>

<ResponsiveContainer width="100%" height={260}>

<LineChart data={chartData}>

<CartesianGrid stroke="var(--border)" vertical={false} />

<XAxis
dataKey="time"
stroke="#9ca3af"
tickLine={false}
axisLine={false}
/>

<YAxis
stroke="#9ca3af"
tickLine={false}
axisLine={false}
/>

<Tooltip
contentStyle={{
backgroundColor:"var(--card)",
border:"1px solid var(--border)",
borderRadius:"8px"
}}
/>

<Line
type="monotone"
dataKey="cost"
stroke="#a855f7"
strokeWidth={3}
dot={false}
activeDot={{ r:6 }}
style={{
filter:"drop-shadow(0px 0px 10px #a855f7)"
}}
/>

</LineChart>

</ResponsiveContainer>

</div>
);
}
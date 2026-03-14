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
};

export default function CPUChart({ data }: { data: Metric[] }) {

const recent = data.slice(-30);

const chartData = recent.map((m,i)=>({
time:i+1,
cpu:m.cpu ?? 0
}));

const highCPU = recent.some(m => (m.cpu ?? 0) > 85);

return (

<div className="chart-card">

<h2 className="text-xl font-semibold mb-4">
CPU Usage
</h2>

<ResponsiveContainer width="100%" height={260}>

<LineChart data={chartData}>

<CartesianGrid
stroke="var(--border)"
vertical={false}
/>

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
type="natural"
dataKey="cpu"
stroke={highCPU ? "#ef4444" : "#3b82f6"}
strokeWidth={3}
dot={false}
isAnimationActive={true}
animationDuration={700}
style={{
filter: highCPU
? "drop-shadow(0px 0px 8px #ef4444)"
: "drop-shadow(0px 0px 6px #3b82f6)"
}}
/>

</LineChart>

</ResponsiveContainer>

</div>
);
}
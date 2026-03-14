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
network?: number;
};

export default function NetworkChart({ data }: { data: Metric[] }) {

const recent = data.slice(-30);

const chartData = recent.map((m,i)=>({
time:i+1,
network:m.network ?? 0
}));

return (

<div className="chart-card">

<h2 className="text-xl font-semibold mb-4 text-[var(--text)]">
Network Traffic
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
dataKey="network"
stroke="#f59e0b"
strokeWidth={3}
dot={false}
activeDot={{ r:6 }}
isAnimationActive={true}
animationDuration={700}
style={{
filter:"drop-shadow(0px 0px 8px #f59e0b)"
}}
/>

</LineChart>

</ResponsiveContainer>

</div>
);
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {

  const pathname = usePathname();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
    }`;

  return (

    <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">

      <h2 className="text-2xl font-bold mb-10">
        Cloud Platform
      </h2>

      <nav className="flex flex-col gap-2">

        <Link href="/dashboard" className={linkClass("/dashboard")}>
          📊 Dashboard
        </Link>

        <Link href="/infrastructure" className={linkClass("/infrastructure")}>
          🖥 Infrastructure
        </Link>

        <Link href="/analytics" className={linkClass("/analytics")}>
          📈 Analytics
        </Link>

        <Link href="/cost" className={linkClass("/cost")}>
          💰 Cost Intelligence
        </Link>

        <Link href="/settings" className={linkClass("/settings")}>
          ⚙ Settings
        </Link>

      </nav>

      <div className="mt-auto text-sm text-zinc-500">
        Cloud Intelligence v1.0
      </div>

    </aside>

  );

}
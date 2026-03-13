"use client";

import Sidebar from "../components/ui/Sidebar";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {

  const router = useRouter();

  const handleLogout = async () => {

    await signOut(auth);
    router.push("/login");

  };

  return (

    <div className="flex">

      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-10">
          Settings
        </h1>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8">

          <h2 className="text-xl font-semibold mb-6">
            Account Settings
          </h2>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded"
          >
            Logout
          </button>

        </div>

      </main>

    </div>

  );
}
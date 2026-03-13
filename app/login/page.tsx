"use client";

import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    setLoading(true);

    try {

      await signInWithEmailAndPassword(auth, email, password);

      router.push("/dashboard");

    } catch (error) {

      alert("Invalid email or password");

    }

    setLoading(false);

  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-black text-white">

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 w-[360px]">

        <h1 className="text-2xl font-bold mb-6">
          Cloud Platform Login
        </h1>

        <input
          className="w-full p-2 mb-4 bg-zinc-800 rounded outline-none"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 mb-6 bg-zinc-800 rounded outline-none"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>

    </div>

  );

}
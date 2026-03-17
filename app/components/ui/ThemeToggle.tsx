"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem("theme", theme);
  }, [mounted, theme]);

  function toggleTheme() {

    if (theme === "dark") {

      document.documentElement.classList.remove("dark");
      setTheme("light");

    } else {

      document.documentElement.classList.add("dark");
      setTheme("dark");

    }

  }

  return (

    <button
      onClick={toggleTheme}
      className="
      px-4 py-2 rounded-lg
      border border-gray-300
      dark:border-zinc-700
      bg-white dark:bg-zinc-900
      text-gray-900 dark:text-white
      shadow-sm hover:shadow-md
      transition-all
      "
    >

      {mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}

    </button>

  );
}

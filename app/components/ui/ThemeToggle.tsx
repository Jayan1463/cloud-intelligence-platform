"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [theme, setTheme] = useState("light");

  useEffect(() => {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }

  }, []);

  function toggleTheme() {

    if (theme === "dark") {

      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");

    } else {

      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
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

      {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}

    </button>

  );
}
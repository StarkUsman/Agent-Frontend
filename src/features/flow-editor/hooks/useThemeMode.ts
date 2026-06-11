import { useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "flow-editor-theme";

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useThemeMode() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
    return "system";
  });

  const colorMode = useMemo<"light" | "dark">(
    () => (theme === "system" ? getSystemMode() : theme),
    [theme]
  );

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const apply = (mode: "light" | "dark") => {
      root.classList.toggle("dark", mode === "dark");
      body.classList.toggle("dark", mode === "dark");
    };
    apply(colorMode);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, colorMode]);

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return { theme, setTheme, colorMode };
}

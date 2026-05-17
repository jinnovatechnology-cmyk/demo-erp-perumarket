import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ColorScheme = "amber" | "blue" | "green" | "purple" | "red";
export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleMode: () => void;
  colors: ColorPalette;
}

interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
}

const COLOR_PALETTES: Record<ColorScheme, ColorPalette> = {
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  green: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
  },
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(mode: ThemeMode, scheme: ColorScheme) {
  const root = document.documentElement;
  const palette = COLOR_PALETTES[scheme];

  // Set color scheme CSS variables
  root.style.setProperty("--color-primary-50", palette[50]);
  root.style.setProperty("--color-primary-100", palette[100]);
  root.style.setProperty("--color-primary-200", palette[200]);
  root.style.setProperty("--color-primary-300", palette[300]);
  root.style.setProperty("--color-primary-400", palette[400]);
  root.style.setProperty("--color-primary-500", palette[500]);
  root.style.setProperty("--color-primary-600", palette[600]);
  root.style.setProperty("--color-primary-700", palette[700]);

  // Set mode variables
  if (mode === "dark") {
    root.style.setProperty("--bg-primary", "#111827");
    root.style.setProperty("--bg-secondary", "#1f2937");
    root.style.setProperty("--bg-tertiary", "#374151");
    root.style.setProperty("--bg-card", "#1f2937");
    root.style.setProperty("--bg-sidebar", "#111827");
    root.style.setProperty("--bg-input", "#374151");
    root.style.setProperty("--text-primary", "#f9fafb");
    root.style.setProperty("--text-secondary", "#d1d5db");
    root.style.setProperty("--text-tertiary", "#9ca3af");
    root.style.setProperty("--text-muted", "#6b7280");
    root.style.setProperty("--border-color", "#374151");
    root.style.setProperty("--border-light", "#4b5563");
    root.style.setProperty("--hover-bg", "#374151");
    root.style.setProperty("--shadow-color", "rgba(0,0,0,0.3)");
  } else {
    root.style.setProperty("--bg-primary", "#f9fafb");
    root.style.setProperty("--bg-secondary", "#f3f4f6");
    root.style.setProperty("--bg-tertiary", "#e5e7eb");
    root.style.setProperty("--bg-card", "#ffffff");
    root.style.setProperty("--bg-sidebar", "#F5F7FA");
    root.style.setProperty("--bg-input", "#ffffff");
    root.style.setProperty("--text-primary", "#111827");
    root.style.setProperty("--text-secondary", "#374151");
    root.style.setProperty("--text-tertiary", "#6b7280");
    root.style.setProperty("--text-muted", "#9ca3af");
    root.style.setProperty("--border-color", "#e5e7eb");
    root.style.setProperty("--border-light", "#f3f4f6");
    root.style.setProperty("--shadow-color", "rgba(0,0,0,0.05)");
    root.style.setProperty("--hover-bg", "#f9fafb");
  }

  // Set data attribute for CSS selectors
  root.setAttribute("data-theme", mode);
  root.setAttribute("data-color", scheme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode");
    return (saved as ThemeMode) || "light";
  });

  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem("theme-color");
    return (saved as ColorScheme) || "amber";
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem("theme-color", scheme);
  };

  const toggleMode = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  useEffect(() => {
    applyThemeToDOM(mode, colorScheme);
  }, [mode, colorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorScheme,
        setMode,
        setColorScheme,
        toggleMode,
        colors: COLOR_PALETTES[colorScheme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { COLOR_PALETTES };

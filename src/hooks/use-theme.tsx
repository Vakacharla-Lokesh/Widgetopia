"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import useLocalStorage from "./use-local-storage";

type CustomColors = {
  background: string;
  foreground: string;
  primary: string;
  ring: string;
};

type Theme = {
  name: string;
  background: string;
  foreground: string;
  backgroundUrl?: string;
  customColors?: Partial<CustomColors>;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (name: string) => void;
  setBackgroundUrl: (url: string) => void;
  setCustomColor: (colorName: keyof CustomColors, value: string) => void;
};

// Function to convert hex to HSL string
const hexToHsl = (hex: string): string => {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

const THEME_CONFIG: Record<string, Record<string, string>> = {
  default: {
    "--background": "40 33% 98%",
    "--foreground": "224 71% 4%",
    "--primary": "163 25% 65%",
    "--ring": "163 19% 72%",
  },
  stone: {
    "--background": "240 10% 3.9%",
    "--foreground": "0 0% 98%",
    "--primary": "240 5.9% 90%",
    "--ring": "240 5.9% 90%",
  },
  orange: {
    "--background": "20 14.3% 4.1%",
    "--foreground": "60 9.1% 97.8%",
    "--primary": "24.6 95% 53.1%",
    "--ring": "24.6 95% 53.1%",
  },
  rose: {
    "--background": "346.8 77.2% 49.8%",
    "--foreground": "355.7 100% 97.3%",
    "--primary": "340.9 95.5% 91%",
    "--ring": "340.9 95.5% 91%",
  },
  violet: {
    "--background": "262.1 83.3% 57.8%",
    "--foreground": "210 40% 98%",
    "--primary": "263.4 92.4% 83.3%",
    "--ring": "263.4 92.4% 83.3%",
  },
  green: {
    "--background": "142.1 76.2% 36.3%",
    "--foreground": "144.9 80.4% 97.3%",
    "--primary": "142.1 70.6% 45.3%",
    "--ring": "142.1 70.6% 45.3%",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useLocalStorage<Theme>("dashboard-theme", {
    name: "default",
    backgroundUrl: "",
    foreground: "#000000",
    background: "#000000",
    customColors: {
      background: "#faf7f5",
      foreground: "#09090b",
      primary: "#a7c5bd",
      ring: "#b9c8c5",
    },
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme.name === "custom") {
      const isDark = ["stone", "orange", "rose", "violet", "green"].includes(
        theme.name
      );
      root.classList.toggle("dark", isDark);

      if (theme.customColors) {
        Object.entries(theme.customColors).forEach(([name, value]) => {
          if (value) {
            root.style.setProperty(`--${name}`, hexToHsl(value));
          }
        });
      }
    } else {
      const isDark = ["stone", "orange", "rose", "violet", "green"].includes(
        theme.name
      );
      root.classList.toggle("dark", isDark);

      const config = THEME_CONFIG[theme.name] || THEME_CONFIG.default;
      for (const [key, value] of Object.entries(config)) {
        root.style.setProperty(key, value);
      }
    }
  }, [theme]);

  const setTheme = (name: string) => {
    setThemeState((prev) => ({ ...prev, name }));
  };

  const setBackgroundUrl = (url: string) => {
    setThemeState((prev) => ({ ...prev, backgroundUrl: url }));
  };

  const setCustomColor = (colorName: keyof CustomColors, value: string) => {
    setThemeState((prev) => ({
      ...prev,
      name: "custom",
      customColors: {
        ...prev.customColors,
        [colorName]: value,
      },
    }));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, setBackgroundUrl, setCustomColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

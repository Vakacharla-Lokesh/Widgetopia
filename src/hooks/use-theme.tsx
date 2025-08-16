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

const hexToHsl = (hex: string): string => {
  if (!hex) return "0 0% 0%";
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `${h} ${s}% ${l}%`;
};

const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.match(/\d+/g)!.map(Number);
    const sDecimal = s / 100;
    const lDecimal = l / 100;
    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lDecimal - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
    else { [r, g, b] = [c, 0, x]; }

    const toHex = (val: number) => {
        const hex = Math.round((val + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


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

const DEFAULT_CUSTOM_COLORS: CustomColors = {
  background: "#faf7f5",
  foreground: "#09090b",
  primary: "#a7c5bd",
  ring: "#b9c8c5",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useLocalStorage<Theme>("dashboard-theme", {
    name: "default",
    backgroundUrl: "",
    foreground: "#09090b",
    background: "#faf7f5",
    customColors: DEFAULT_CUSTOM_COLORS,
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (themeName: string, customColors?: Partial<CustomColors>) => {
        if (themeName === 'custom' && customColors) {
            Object.entries(customColors).forEach(([name, value]) => {
                if (value) root.style.setProperty(`--${name}`, hexToHsl(value));
            });
        } else {
            const config = THEME_CONFIG[themeName] || THEME_CONFIG.default;
            Object.entries(config).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }
        const isDark = ["stone", "orange", "rose", "violet", "green"].includes(themeName);
        root.classList.toggle("dark", isDark);
    }
    applyTheme(theme.name, theme.customColors);

  }, [theme]);
  
  const setTheme = (name: string) => {
    if (name === 'custom') {
        setThemeState((prev) => ({ ...prev, name }));
    } else {
        const config = THEME_CONFIG[name] || THEME_CONFIG.default;
        const newCustomColors: Partial<CustomColors> = {
            background: hslToHex(config['--background']),
            foreground: hslToHex(config['--foreground']),
            primary: hslToHex(config['--primary']),
            ring: hslToHex(config['--ring']),
        };
        setThemeState((prev) => ({ 
            ...prev,
            name,
            customColors: {
                ...prev.customColors,
                ...newCustomColors,
            }
        }));
    }
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

    
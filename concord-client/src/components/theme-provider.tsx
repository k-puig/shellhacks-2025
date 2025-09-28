import { createContext, useContext, useEffect, useState } from "react";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  // Sidebar colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description?: string;
  mode: "light" | "dark";
  colors: ThemeColors;
  isCustom?: boolean;
}

// Fixed themes using proper OKLCH format
const DEFAULT_THEMES: ThemeDefinition[] = [
  {
    id: "default-light",
    name: "Default Light",
    mode: "light",
    colors: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      secondary: "oklch(0.97 0 0)",
      secondaryForeground: "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      accentForeground: "oklch(0.205 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
      chart1: "oklch(0.646 0.222 41.116)",
      chart2: "oklch(0.6 0.118 184.704)",
      chart3: "oklch(0.398 0.07 227.392)",
      chart4: "oklch(0.828 0.189 84.429)",
      chart5: "oklch(0.769 0.188 70.08)",
      sidebar: "oklch(0.985 0 0)",
      sidebarForeground: "oklch(0.145 0 0)",
      sidebarPrimary: "oklch(0.205 0 0)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
      sidebarAccent: "oklch(0.97 0 0)",
      sidebarAccentForeground: "oklch(0.205 0 0)",
      sidebarBorder: "oklch(0.922 0 0)",
      sidebarRing: "oklch(0.708 0 0)",
    },
  },
  {
    id: "default-dark",
    name: "Default Dark",
    mode: "dark",
    colors: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      cardForeground: "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      popoverForeground: "oklch(0.985 0 0)",
      primary: "oklch(0.922 0 0)",
      primaryForeground: "oklch(0.205 0 0)",
      secondary: "oklch(0.269 0 0)",
      secondaryForeground: "oklch(0.985 0 0)",
      muted: "oklch(0.269 0 0)",
      mutedForeground: "oklch(0.708 0 0)",
      accent: "oklch(0.269 0 0)",
      accentForeground: "oklch(0.985 0 0)",
      destructive: "oklch(0.704 0.191 22.216)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.556 0 0)",
      chart1: "oklch(0.488 0.243 264.376)",
      chart2: "oklch(0.696 0.17 162.48)",
      chart3: "oklch(0.769 0.188 70.08)",
      chart4: "oklch(0.627 0.265 303.9)",
      chart5: "oklch(0.645 0.246 16.439)",
      sidebar: "oklch(0.205 0 0)",
      sidebarForeground: "oklch(0.985 0 0)",
      sidebarPrimary: "oklch(0.488 0.243 264.376)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
      sidebarAccent: "oklch(0.269 0 0)",
      sidebarAccentForeground: "oklch(0.985 0 0)",
      sidebarBorder: "oklch(1 0 0 / 10%)",
      sidebarRing: "oklch(0.556 0 0)",
    },
  },
  {
    id: "paper-light",
    name: "Paper",
    description: "Clean paper-like theme",
    mode: "light",
    colors: {
      background: "oklch(0.99 0.01 85)",
      foreground: "oklch(0.15 0.02 65)",
      card: "oklch(0.99 0.01 85)",
      cardForeground: "oklch(0.15 0.02 65)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.15 0.02 65)",
      primary: "oklch(0.25 0.03 45)",
      primaryForeground: "oklch(0.98 0.01 85)",
      secondary: "oklch(0.96 0.01 75)",
      secondaryForeground: "oklch(0.25 0.03 45)",
      muted: "oklch(0.96 0.01 75)",
      mutedForeground: "oklch(0.45 0.02 55)",
      accent: "oklch(0.96 0.01 75)",
      accentForeground: "oklch(0.25 0.03 45)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.90 0.01 65)",
      input: "oklch(0.90 0.01 65)",
      ring: "oklch(0.25 0.03 45)",
      chart1: "oklch(0.646 0.222 41.116)",
      chart2: "oklch(0.6 0.118 184.704)",
      chart3: "oklch(0.398 0.07 227.392)",
      chart4: "oklch(0.828 0.189 84.429)",
      chart5: "oklch(0.769 0.188 70.08)",
      sidebar: "oklch(0.97 0.01 80)",
      sidebarForeground: "oklch(0.15 0.02 65)",
      sidebarPrimary: "oklch(0.25 0.03 45)",
      sidebarPrimaryForeground: "oklch(0.98 0.01 85)",
      sidebarAccent: "oklch(0.94 0.01 75)",
      sidebarAccentForeground: "oklch(0.25 0.03 45)",
      sidebarBorder: "oklch(0.88 0.01 65)",
      sidebarRing: "oklch(0.25 0.03 45)",
    },
  },
  {
    id: "comfy-brown-dark",
    name: "Comfy Brown",
    description: "Warm brown theme for dark mode",
    mode: "dark",
    colors: {
      background: "oklch(0.15 0.03 65)",
      foreground: "oklch(0.95 0.01 85)",
      card: "oklch(0.20 0.03 55)",
      cardForeground: "oklch(0.95 0.01 85)",
      popover: "oklch(0.20 0.03 55)",
      popoverForeground: "oklch(0.95 0.01 85)",
      primary: "oklch(0.65 0.15 45)",
      primaryForeground: "oklch(0.95 0.01 85)",
      secondary: "oklch(0.25 0.04 50)",
      secondaryForeground: "oklch(0.95 0.01 85)",
      muted: "oklch(0.25 0.04 50)",
      mutedForeground: "oklch(0.70 0.02 65)",
      accent: "oklch(0.25 0.04 50)",
      accentForeground: "oklch(0.95 0.01 85)",
      destructive: "oklch(0.704 0.191 22.216)",
      border: "oklch(0.30 0.04 55)",
      input: "oklch(0.30 0.04 55)",
      ring: "oklch(0.65 0.15 45)",
      chart1: "oklch(0.65 0.15 45)",
      chart2: "oklch(0.55 0.12 85)",
      chart3: "oklch(0.75 0.18 25)",
      chart4: "oklch(0.60 0.14 105)",
      chart5: "oklch(0.70 0.16 65)",
      sidebar: "oklch(0.18 0.03 60)",
      sidebarForeground: "oklch(0.95 0.01 85)",
      sidebarPrimary: "oklch(0.65 0.15 45)",
      sidebarPrimaryForeground: "oklch(0.95 0.01 85)",
      sidebarAccent: "oklch(0.22 0.04 50)",
      sidebarAccentForeground: "oklch(0.95 0.01 85)",
      sidebarBorder: "oklch(0.28 0.04 55)",
      sidebarRing: "oklch(0.65 0.15 45)",
    },
  },
  {
    id: "midnight-dark",
    name: "Midnight",
    description: "Deep blue midnight theme",
    mode: "dark",
    colors: {
      background: "oklch(0.12 0.08 250)",
      foreground: "oklch(0.95 0.01 230)",
      card: "oklch(0.18 0.06 240)",
      cardForeground: "oklch(0.95 0.01 230)",
      popover: "oklch(0.18 0.06 240)",
      popoverForeground: "oklch(0.95 0.01 230)",
      primary: "oklch(0.60 0.20 240)",
      primaryForeground: "oklch(0.95 0.01 230)",
      secondary: "oklch(0.22 0.05 235)",
      secondaryForeground: "oklch(0.95 0.01 230)",
      muted: "oklch(0.22 0.05 235)",
      mutedForeground: "oklch(0.70 0.02 230)",
      accent: "oklch(0.22 0.05 235)",
      accentForeground: "oklch(0.95 0.01 230)",
      destructive: "oklch(0.704 0.191 22.216)",
      border: "oklch(0.25 0.05 235)",
      input: "oklch(0.25 0.05 235)",
      ring: "oklch(0.60 0.20 240)",
      chart1: "oklch(0.60 0.20 240)",
      chart2: "oklch(0.50 0.15 200)",
      chart3: "oklch(0.65 0.18 280)",
      chart4: "oklch(0.55 0.16 160)",
      chart5: "oklch(0.70 0.22 300)",
      sidebar: "oklch(0.15 0.07 245)",
      sidebarForeground: "oklch(0.95 0.01 230)",
      sidebarPrimary: "oklch(0.60 0.20 240)",
      sidebarPrimaryForeground: "oklch(0.95 0.01 230)",
      sidebarAccent: "oklch(0.20 0.05 235)",
      sidebarAccentForeground: "oklch(0.95 0.01 230)",
      sidebarBorder: "oklch(0.22 0.05 235)",
      sidebarRing: "oklch(0.60 0.20 240)",
    },
  },
];

type ThemeMode = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
};

type ThemeProviderState = {
  mode: ThemeMode;
  currentTheme: ThemeDefinition;
  currentLightTheme: ThemeDefinition;
  currentDarkTheme: ThemeDefinition;
  themes: ThemeDefinition[];
  setMode: (mode: ThemeMode) => void;
  setTheme: (themeId: string) => void;
  addCustomTheme: (theme: Omit<ThemeDefinition, "id" | "isCustom">) => void;
  removeCustomTheme: (themeId: string) => void;
  getThemesForMode: (mode: "light" | "dark") => ThemeDefinition[];
};

const initialState: ThemeProviderState = {
  mode: "system",
  currentTheme: DEFAULT_THEMES[1], // Default to dark theme
  currentLightTheme: DEFAULT_THEMES[0], // Default light
  currentDarkTheme: DEFAULT_THEMES[1], // Default dark
  themes: DEFAULT_THEMES,
  setMode: () => null,
  setTheme: () => null,
  addCustomTheme: () => null,
  removeCustomTheme: () => null,
  getThemesForMode: () => [],
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "concord-theme",
  ...props
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(
    () =>
      (localStorage.getItem(storageKey + "-mode") as ThemeMode) || defaultTheme,
  );

  const [themes, setThemes] = useState<ThemeDefinition[]>(() => {
    const saved = localStorage.getItem(storageKey + "-themes");
    const customThemes = saved ? JSON.parse(saved) : [];
    return [...DEFAULT_THEMES, ...customThemes];
  });

  const [currentLightThemeId, setCurrentLightThemeId] = useState<string>(() => {
    const saved = localStorage.getItem(storageKey + "-light");
    return saved || "default-light";
  });

  const [currentDarkThemeId, setCurrentDarkThemeId] = useState<string>(() => {
    const saved = localStorage.getItem(storageKey + "-dark");
    return saved || "default-dark";
  });

  const currentLightTheme =
    themes.find((t) => t.id === currentLightThemeId) || DEFAULT_THEMES[0];
  const currentDarkTheme =
    themes.find((t) => t.id === currentDarkThemeId) || DEFAULT_THEMES[2];

  // Determine the current theme based on mode and system preference
  const getCurrentTheme = (): ThemeDefinition => {
    switch (mode) {
      case "light":
        return currentLightTheme;
      case "dark":
        return currentDarkTheme;
      case "system":
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        return systemPrefersDark ? currentDarkTheme : currentLightTheme;
      default:
        return currentDarkTheme;
    }
  };

  const currentTheme = getCurrentTheme();

  const applyTheme = (theme: ThemeDefinition) => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Apply mode class
    root.classList.add(theme.mode);

    // Apply CSS custom properties with proper mapping
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case and map to CSS variables
      const cssVarMap: Record<string, string> = {
        background: "--background",
        foreground: "--foreground",
        card: "--card",
        cardForeground: "--card-foreground",
        popover: "--popover",
        popoverForeground: "--popover-foreground",
        primary: "--primary",
        primaryForeground: "--primary-foreground",
        secondary: "--secondary",
        secondaryForeground: "--secondary-foreground",
        muted: "--muted",
        mutedForeground: "--muted-foreground",
        accent: "--accent",
        accentForeground: "--accent-foreground",
        destructive: "--destructive",
        border: "--border",
        input: "--input",
        ring: "--ring",
        chart1: "--chart-1",
        chart2: "--chart-2",
        chart3: "--chart-3",
        chart4: "--chart-4",
        chart5: "--chart-5",
        sidebar: "--sidebar",
        sidebarForeground: "--sidebar-foreground",
        sidebarPrimary: "--sidebar-primary",
        sidebarPrimaryForeground: "--sidebar-primary-foreground",
        sidebarAccent: "--sidebar-accent",
        sidebarAccentForeground: "--sidebar-accent-foreground",
        sidebarBorder: "--sidebar-border",
        sidebarRing: "--sidebar-ring",
      };

      const cssVar = cssVarMap[key];
      if (cssVar) {
        root.style.setProperty(cssVar, value);
      }
    });
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (mode === "system") {
        // Theme will be recalculated due to getCurrentTheme dependency
        const newTheme = getCurrentTheme();
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode, currentLightTheme, currentDarkTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    // Update the appropriate theme based on the theme's mode
    if (theme.mode === "light") {
      setCurrentLightThemeId(themeId);
      localStorage.setItem(storageKey + "-light", themeId);
    } else {
      setCurrentDarkThemeId(themeId);
      localStorage.setItem(storageKey + "-dark", themeId);
    }
  };

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(storageKey + "-mode", newMode);
  };

  const addCustomTheme = (
    themeData: Omit<ThemeDefinition, "id" | "isCustom">,
  ) => {
    const newTheme: ThemeDefinition = {
      ...themeData,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };

    const updatedThemes = [...themes, newTheme];
    setThemes(updatedThemes);

    // Save only custom themes to localStorage
    const customThemes = updatedThemes.filter((t) => t.isCustom);
    localStorage.setItem(storageKey + "-themes", JSON.stringify(customThemes));
  };

  const removeCustomTheme = (themeId: string) => {
    const updatedThemes = themes.filter((t) => t.id !== themeId);
    setThemes(updatedThemes);

    // If removing current theme, switch to default
    if (currentLightThemeId === themeId) {
      const defaultLight = updatedThemes.find(
        (t) => t.mode === "light" && !t.isCustom,
      );
      if (defaultLight) {
        setCurrentLightThemeId(defaultLight.id);
        localStorage.setItem(storageKey + "-light", defaultLight.id);
      }
    }

    if (currentDarkThemeId === themeId) {
      const defaultDark = updatedThemes.find(
        (t) => t.mode === "dark" && !t.isCustom,
      );
      if (defaultDark) {
        setCurrentDarkThemeId(defaultDark.id);
        localStorage.setItem(storageKey + "-dark", defaultDark.id);
      }
    }

    // Save only custom themes to localStorage
    const customThemes = updatedThemes.filter((t) => t.isCustom);
    localStorage.setItem(storageKey + "-themes", JSON.stringify(customThemes));
  };

  const getThemesForMode = (targetMode: "light" | "dark") => {
    return themes.filter((t) => t.mode === targetMode);
  };

  const value = {
    mode,
    currentTheme,
    currentLightTheme,
    currentDarkTheme,
    themes,
    setMode: handleSetMode,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    getThemesForMode,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

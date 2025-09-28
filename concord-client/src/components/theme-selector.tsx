import React, { useState } from "react";
import { Moon, Sun, Monitor, Palette, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useTheme,
  ThemeDefinition,
  ThemeColors,
} from "@/components/theme-provider";

// Theme color input component for OKLCH values
const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={label} className="text-right text-sm">
        {label}
      </Label>
      <Input
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="col-span-3 font-mono text-sm"
        placeholder="oklch(0.5 0.1 180)"
      />
    </div>
  );
};

// Custom theme creation modal
const CreateThemeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: Omit<ThemeDefinition, "id" | "isCustom">) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [colors, setColors] = useState<ThemeColors>({
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
  });

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      mode,
      colors,
    });

    // Reset form
    setName("");
    setDescription("");
    setMode("dark");
    onClose();
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Theme</DialogTitle>
          <DialogDescription>
            Create a custom theme by defining colors in OKLCH format (e.g.,
            "oklch(0.5 0.1 180)")
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="theme-name" className="text-right">
                Name
              </Label>
              <Input
                id="theme-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="My Custom Theme"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="theme-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="theme-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="theme-mode" className="text-right">
                Mode
              </Label>
              <Select
                value={mode}
                onValueChange={(v: "light" | "dark") => setMode(v)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color sections */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Colors</h4>
            <div className="space-y-3">
              <ColorInput
                label="Background"
                value={colors.background}
                onChange={(v) => updateColor("background", v)}
              />
              <ColorInput
                label="Foreground"
                value={colors.foreground}
                onChange={(v) => updateColor("foreground", v)}
              />
              <ColorInput
                label="Primary"
                value={colors.primary}
                onChange={(v) => updateColor("primary", v)}
              />
              <ColorInput
                label="Secondary"
                value={colors.secondary}
                onChange={(v) => updateColor("secondary", v)}
              />
            </div>

            <h4 className="font-medium">Sidebar Colors</h4>
            <div className="space-y-3">
              <ColorInput
                label="Sidebar"
                value={colors.sidebar}
                onChange={(v) => updateColor("sidebar", v)}
              />
              <ColorInput
                label="Sidebar Primary"
                value={colors.sidebarPrimary}
                onChange={(v) => updateColor("sidebarPrimary", v)}
              />
              <ColorInput
                label="Sidebar Accent"
                value={colors.sidebarAccent}
                onChange={(v) => updateColor("sidebarAccent", v)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Create Theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main theme selector component
export function ThemeSelector() {
  const {
    mode,
    currentTheme,
    // themes,
    setMode,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    getThemesForMode,
  } = useTheme();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const lightThemes = getThemesForMode("light");
  const darkThemes = getThemesForMode("dark");

  const getCurrentModeIcon = () => {
    switch (mode) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {getCurrentModeIcon()}
            <span className="ml-2">{currentTheme.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Mode Selection */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs">Mode</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setMode("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
              {mode === "light" && (
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMode("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
              {mode === "dark" && (
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMode("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
              {mode === "system" && (
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Light Themes */}
          {lightThemes.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">
                Light Themes
              </DropdownMenuLabel>
              {lightThemes.map((theme) => (
                <DropdownMenuItem
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className="justify-between"
                >
                  <div className="flex items-center">
                    <Palette className="mr-2 h-4 w-4" />
                    <span>{theme.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentTheme.id === theme.id && (
                      <Badge variant="secondary">Active</Badge>
                    )}
                    {theme.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomTheme(theme.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}

          {lightThemes.length > 0 && darkThemes.length > 0 && (
            <DropdownMenuSeparator />
          )}

          {/* Dark Themes */}
          {darkThemes.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">
                Dark Themes
              </DropdownMenuLabel>
              {darkThemes.map((theme) => (
                <DropdownMenuItem
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className="justify-between"
                >
                  <div className="flex items-center">
                    <Palette className="mr-2 h-4 w-4" />
                    <span>{theme.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentTheme.id === theme.id && (
                      <Badge variant="secondary">Active</Badge>
                    )}
                    {theme.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomTheme(theme.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}

          <DropdownMenuSeparator />

          {/* Add Custom Theme */}
          <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Theme</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateThemeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={addCustomTheme}
      />
    </>
  );
}

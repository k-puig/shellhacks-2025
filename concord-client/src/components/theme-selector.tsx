import React, { useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Palette,
  Plus,
  Trash2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

        <ScrollArea className="max-h-96">
          <div className="space-y-6 pr-4">
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

            <Separator />

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

              <Separator />

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
        </ScrollArea>

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

// Main theme selector component as modal
export function ThemeSelector() {
  const {
    mode,
    currentTheme,
    setMode,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    getThemesForMode,
  } = useTheme();

  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
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
      <Dialog open={isMainModalOpen} onOpenChange={setIsMainModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Theme
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getCurrentModeIcon()}
              Appearance Settings
            </DialogTitle>
            <DialogDescription>
              Choose your preferred theme and color scheme
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Theme Display */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{currentTheme.name}</p>
                {currentTheme.description && (
                  <p className="text-sm text-muted-foreground">
                    {currentTheme.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            {/* Mode Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Display Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={mode === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("light")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={mode === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("dark")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={mode === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("system")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Monitor className="h-4 w-4" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Themes</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>

              <ScrollArea className="max-h-64">
                <div className="space-y-3">
                  {/* Light Themes */}
                  {lightThemes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Light Themes
                      </p>
                      {lightThemes.map((theme) => (
                        <div
                          key={theme.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => setTheme(theme.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {theme.name}
                              </p>
                              {theme.description && (
                                <p className="text-xs text-muted-foreground">
                                  {theme.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentTheme.id === theme.id && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                            {theme.isCustom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCustomTheme(theme.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dark Themes */}
                  {darkThemes.length > 0 && (
                    <div className="space-y-2">
                      {lightThemes.length > 0 && <Separator />}
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Dark Themes
                      </p>
                      {darkThemes.map((theme) => (
                        <div
                          key={theme.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => setTheme(theme.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {theme.name}
                              </p>
                              {theme.description && (
                                <p className="text-xs text-muted-foreground">
                                  {theme.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentTheme.id === theme.id && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                            {theme.isCustom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCustomTheme(theme.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMainModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateThemeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={addCustomTheme}
      />
    </>
  );
}

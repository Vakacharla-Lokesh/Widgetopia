"use client";

import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const THEMES = [
  { name: "Default", value: "default" },
  { name: "Stone", value: "stone" },
  { name: "Orange", value: "orange" },
  { name: "Rose", value: "rose" },
  { name: "Violet", value: "violet" },
  { name: "Green", value: "green" },
];

export default function SettingsPanel() {
  const { theme, setTheme, setBackgroundUrl, setCustomColor } = useTheme();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = React.useState(theme.backgroundUrl || "");
  const [error, setError] = React.useState("");
  const importFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should not exceed 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBackgroundUrl(result);
        setImageUrl(result);
        setError("");
      };
      reader.onerror = () => {
        setError("Failed to read file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const applyUrlBackground = () => {
    setBackgroundUrl(imageUrl);
  };

  const removeBackground = () => {
    setBackgroundUrl("");
    setImageUrl("");
  };

  const handleColorChange = (
    colorName: "primary" | "background" | "foreground" | "ring",
    value: string
  ) => {
    setCustomColor(colorName, value);
  };

  const handleExport = () => {
    const exportData: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          exportData[key] = JSON.parse(localStorage.getItem(key)!);
        } catch (e) {
          exportData[key] = localStorage.getItem(key);
        }
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `widgetopia-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Import failed",
        description: "No file selected.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string")
          throw new Error("File content is not readable text.");

        const data = JSON.parse(text);

        // Clear existing settings before import
        localStorage.clear();

        Object.keys(data).forEach((key) => {
          const value = data[key];
          // If the value is an object or array, stringify it. Otherwise, store as-is.
          const valueToStore =
            typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value);
          localStorage.setItem(key, valueToStore);
        });

        toast({
          title: "Import Successful",
          description:
            "Your settings have been restored. The page will now reload.",
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        toast({
          title: "Import Failed",
          description: `Invalid settings file. ${errorMessage}`,
          variant: "destructive",
        });
        console.error("Import error:", err);
      }
    };
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
    };
    reader.readAsText(file);

    // Reset file input value to allow re-importing the same file
    event.target.value = "";
  };

  return (
    <div className="py-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Select a preset theme or create your own.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {THEMES.map((themeOption) => (
              <Button
                key={themeOption.value}
                variant={
                  theme.name === themeOption.value ? "default" : "outline"
                }
                onClick={() => setTheme(themeOption.value)}
              >
                {themeOption.name}
              </Button>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Custom Colors</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary</Label>
                <Input
                  id="primary-color"
                  type="color"
                  value={theme.customColors?.primary || "#a7c5bd"}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="p-1 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background-color">Background</Label>
                <Input
                  id="background-color"
                  type="color"
                  value={theme.customColors?.background || "#faf7f5"}
                  onChange={(e) =>
                    handleColorChange("background", e.target.value)
                  }
                  className="p-1 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foreground-color">Foreground</Label>
                <Input
                  id="foreground-color"
                  type="color"
                  value={theme.customColors?.foreground || "#09090b"}
                  onChange={(e) =>
                    handleColorChange("foreground", e.target.value)
                  }
                  className="p-1 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ring-color">Accent Ring</Label>
                <Input
                  id="ring-color"
                  type="color"
                  value={theme.customColors?.ring || "#b9c8c5"}
                  onChange={(e) => handleColorChange("ring", e.target.value)}
                  className="p-1 h-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background Image</CardTitle>
          <CardDescription>
            Set a custom background image from a URL or by uploading.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bg-url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="bg-url"
                type="text"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={handleUrlChange}
              />
              <Button onClick={applyUrlBackground}>Apply</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bg-upload">Upload Image</Label>
            <Input
              id="bg-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          {theme.backgroundUrl && (
            <Button
              variant="destructive"
              onClick={removeBackground}
            >
              Remove Background
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your current settings to a file, or import a configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Settings
          </Button>
          <Button
            onClick={handleImportClick}
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Settings
          </Button>
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleImport}
            className="hidden"
            accept="application/json"
          />
        </CardContent>
      </Card>
    </div>
  );
}

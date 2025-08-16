"use client";

import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const THEMES = [
  { name: 'Default', value: 'default' },
  { name: 'Stone', value: 'stone' },
  { name: 'Orange', value: 'orange' },
  { name: 'Rose', value: 'rose' },
  { name: 'Violet', value: 'violet' },
  { name: 'Green', value: 'green' },
];

export default function SettingsPanel() {
  const { theme, setTheme, setBackgroundUrl, setCustomColor } = useTheme();
  const [imageUrl, setImageUrl] = React.useState(theme.backgroundUrl || '');
  const [error, setError] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should not exceed 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBackgroundUrl(result);
        setImageUrl(result);
        setError('');
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };
  
  const applyUrlBackground = () => {
    setBackgroundUrl(imageUrl);
  }

  const removeBackground = () => {
    setBackgroundUrl('');
    setImageUrl('');
  };

  const handleColorChange = (colorName: 'primary' | 'background' | 'foreground' | 'ring', value: string) => {
    setCustomColor(colorName, value);
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
        <CardContent className='space-y-6'>
          <div className="grid grid-cols-3 gap-4">
            {THEMES.map((themeOption) => (
              <Button
                key={themeOption.value}
                variant={theme.name === themeOption.value ? 'default' : 'outline'}
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
                  value={theme.customColors?.primary || '#a7c5bd'}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="p-1 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background-color">Background</Label>
                <Input
                  id="background-color"
                  type="color"
                  value={theme.customColors?.background || '#faf7f5'}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                   className="p-1 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foreground-color">Foreground</Label>
                <Input
                  id="foreground-color"
                  type="color"
                  value={theme.customColors?.foreground || '#09090b'}
                  onChange={(e) => handleColorChange('foreground', e.target.value)}
                   className="p-1 h-10"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="ring-color">Accent Ring</Label>
                <Input
                  id="ring-color"
                  type="color"
                  value={theme.customColors?.ring || '#b9c8c5'}
                  onChange={(e) => handleColorChange('ring', e.target.value)}
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
            <Input id="bg-upload" type="file" accept="image/*" onChange={handleFileChange} />
             {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          {theme.backgroundUrl && (
            <Button variant="destructive" onClick={removeBackground}>
              Remove Background
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

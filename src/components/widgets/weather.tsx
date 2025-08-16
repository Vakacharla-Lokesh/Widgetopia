"use client";

import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Cloud,
  Sun,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Settings,
  Loader2,
} from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export default function Weather() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useLocalStorage<string>(
    "weather-widget-city",
    "New York"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCity, setNewCity] = useState(city);

  const popularCities = [
    "New York",
    "London",
    "Paris",
    "Tokyo",
    "Delhi",
    "Sydney",
    "Toronto",
    "Berlin",
    "Moscow",
    "Singapore",
  ];

  useEffect(() => {
    async function fetchWeather() {
      if (!city) {
        setLoading(false);
        setError("Please set a city.");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
        );
        const data = await res.json();

        if (res.ok) {
          setWeatherData({
            city: data.location.name,
            country: data.location.country,
            temperature: Math.round(data.current.temp_c),
            condition: data.current.condition.text,
            unit: "C",
          });
        } else {
          setError(data.error.message || "Failed to fetch weather data.");
          setWeatherData(null);
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
        setError("An error occurred while fetching data.");
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [city]);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    const iconProps = { className: "w-16 h-16" };
    if (c.includes("sun") || c.includes("clear")) return <Sun {...iconProps} />;
    if (c.includes("partly") || c.includes("cloud"))
      return <CloudSun {...iconProps} />;
    if (c.includes("rain") || c.includes("drizzle"))
      return <CloudRain {...iconProps} />;
    if (c.includes("snow") || c.includes("sleet"))
      return <CloudSnow {...iconProps} />;
    if (c.includes("thunder")) return <CloudLightning {...iconProps} />;
    return <Cloud {...iconProps} />;
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCity.trim()) {
      setCity(newCity.trim());
      setIsDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading weather...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-2 text-center rounded-xl group p-4">
      {error || !weatherData ? (
        <div className="text-destructive text-center">
          <p>{error || "Failed to load weather data."}</p>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-semibold">
            {weatherData.city}, {weatherData.country}
          </h3>
          <div className="flex items-center gap-4 text-primary">
            {getWeatherIcon(weatherData.condition)}
            <p className="text-6xl font-bold text-foreground">
              {weatherData.temperature}°
              <span className="text-4xl text-muted-foreground">
                {weatherData.unit}
              </span>
            </p>
          </div>
          <p className="text-lg text-muted-foreground">
            {weatherData.condition}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Powered by WeatherAPI
          </p>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          setNewCity(city);
          setIsDialogOpen(true);
        }}
      >
        <Settings className="h-5 w-5" />
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change City</DialogTitle>
            <DialogDescription>
              Enter a new city or select one from the list.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSettingsSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="city-input"
                  className="text-right"
                >
                  City
                </Label>
                <Input
                  id="city-input"
                  list="city-options"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., London"
                />
                <datalist id="city-options">
                  {popularCities.map((c) => (
                    <option
                      key={c}
                      value={c}
                    />
                  ))}
                </datalist>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

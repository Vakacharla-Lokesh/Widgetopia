"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Sun,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Settings,
} from "lucide-react";

export default function Weather() {
  const { theme } = useTheme();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("New York");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCity, setNewCity] = useState("");

  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  // optional list of popular cities for dropdown
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
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
        );
        const data = await res.json();
        setWeatherData({
          city: data.location.name,
          country: data.location.country,
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          unit: "C",
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [city]);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("sun") || c.includes("clear"))
      return <Sun className="w-16 h-16 text-yellow-400" />;
    if (c.includes("partly") || c.includes("cloud"))
      return <CloudSun className="w-16 h-16 text-yellow-400" />;
    if (c.includes("rain"))
      return <CloudRain className="w-16 h-16 text-blue-400" />;
    if (c.includes("snow"))
      return <CloudSnow className="w-16 h-16 text-white" />;
    if (c.includes("thunder"))
      return <CloudLightning className="w-16 h-16 text-yellow-500" />;
    return <Cloud className="w-16 h-16 text-gray-400" />;
  };

  if (loading) return <p className="text-center">Loading weather...</p>;
  if (!weatherData)
    return <p className="text-center">Failed to load weather</p>;

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-2 text-center rounded-xl group"
      style={{ backgroundColor: theme.background, color: theme.foreground }}
    >
      <h3 className="text-2xl font-semibold">
        {weatherData.city}, {weatherData.country}
      </h3>
      <div className="flex items-center gap-4">
        {getWeatherIcon(weatherData.condition)}
        <p className="text-6xl font-bold">
          {weatherData.temperature}°
          <span className="text-4xl text-muted-foreground">
            {weatherData.unit}
          </span>
        </p>
      </div>
      <p className="text-lg text-muted-foreground">{weatherData.condition}</p>
      <p className="text-xs text-muted-foreground mt-4">
        Powered by WeatherAPI
      </p>

      {/* Settings button (hover bottom-right) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsDialogOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Dialog for city input */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl shadow-lg border"
          style={{
            backgroundColor: theme.background,
            color: theme.foreground,
          }}
        >
          <DialogHeader>
            <DialogTitle>Change City</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCity.trim()) {
                setCity(newCity.trim());
                setIsDialogOpen(false);
                setNewCity("");
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Enter city name"
              list="city-options"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="w-full rounded-md border p-2 text-sm placeholder-opacity-70"
              style={{
                backgroundColor: theme.background,
                color: theme.foreground, // fixes invisible text
                borderColor: theme.foreground,
              }}
            />
            {/* Datalist for suggestions */}
            <datalist id="city-options">
              {popularCities.map((c) => (
                <option
                  key={c}
                  value={c}
                />
              ))}
            </datalist>

            <Button
              type="submit"
              className="rounded-lg"
              style={{
                backgroundColor: theme.foreground,
                color: theme.background,
              }}
            >
              Update
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

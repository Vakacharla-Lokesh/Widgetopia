"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Brain, Coffee } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function Pomodoro() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [totalSeconds, setTotalSeconds] = useState(WORK_MINUTES * 60);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      const newMode = mode === "work" ? "break" : "work";
      const newTotalSeconds = (newMode === "work" ? WORK_MINUTES : BREAK_MINUTES) * 60;
      setMode(newMode);
      setTotalSeconds(newTotalSeconds);
      setSecondsLeft(newTotalSeconds);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = useCallback(() => {
    setIsActive(false);
    setMode("work");
    setTotalSeconds(WORK_MINUTES * 60);
    setSecondsLeft(WORK_MINUTES * 60);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const progress = (secondsLeft / totalSeconds) * 100;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
        <div className={`flex items-center gap-2 text-lg font-semibold ${mode === 'work' ? 'text-destructive' : 'text-primary'}`}>
            {mode === 'work' ? <Brain /> : <Coffee />}
            <span>{mode === 'work' ? 'Time to Focus' : 'Time for a Break'}</span>
        </div>
      <div className="text-6xl font-mono font-bold" suppressHydrationWarning>
        {formatTime(secondsLeft)}
      </div>
      <Progress value={progress} className="w-3/4" />
      <div className="flex gap-2 mt-2">
        <Button onClick={toggle} size="lg">
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <Button onClick={reset} variant="outline" size="lg">
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

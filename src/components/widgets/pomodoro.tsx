"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Brain, Coffee, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import useLocalStorage from "@/hooks/use-local-storage";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PomodoroProps {
  widgetId: string;
}

export default function Pomodoro({ widgetId }: PomodoroProps) {
  const [workMinutes, setWorkMinutes] = useLocalStorage(
    `pomodoro-work-${widgetId}`,
    25
  );
  const [breakMinutes, setBreakMinutes] = useLocalStorage(
    `pomodoro-break-${widgetId}`,
    5
  );

  const [mode, setMode] = useState<"work" | "break">("work");
  const [totalSeconds, setTotalSeconds] = useState(workMinutes * 60);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for inputs inside the dialog
  const [tempWorkMinutes, setTempWorkMinutes] = useState(workMinutes);
  const [tempBreakMinutes, setTempBreakMinutes] = useState(breakMinutes);

  useEffect(() => {
    const newTotal = (mode === "work" ? workMinutes : breakMinutes) * 60;
    setTotalSeconds(newTotal);
    if (!isActive) {
      setSecondsLeft(newTotal);
    }
  }, [workMinutes, breakMinutes, mode, isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      // Switch mode automatically
      const newMode = mode === "work" ? "break" : "work";
      setMode(newMode);
      setIsActive(false); // Pause timer after switch
      // Optionally start next phase automatically:
      // const newTotal = (newMode === 'work' ? workMinutes : breakMinutes) * 60;
      // setSecondsLeft(newTotal);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode, workMinutes, breakMinutes]);

  const toggle = () => {
    if (secondsLeft === 0) {
      reset();
    }
    setIsActive(!isActive);
  };

  const reset = useCallback(() => {
    setIsActive(false);
    setMode("work");
    setSecondsLeft(workMinutes * 60);
  }, [workMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkMinutes(tempWorkMinutes > 0 ? tempWorkMinutes : 1);
    setBreakMinutes(tempBreakMinutes > 0 ? tempBreakMinutes : 1);
    setIsDialogOpen(false);
  };

  const progress = (secondsLeft / totalSeconds) * 100;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 text-center p-2 group">
      <div
        className={`flex items-center gap-2 text-lg font-semibold ${
          mode === "work" ? "text-destructive" : "text-primary"
        }`}
      >
        {mode === "work" ? <Brain /> : <Coffee />}
        <span>{mode === "work" ? "Time to Focus" : "Time for a Break"}</span>
      </div>
      <div
        className="text-6xl font-mono font-bold"
        suppressHydrationWarning
      >
        {formatTime(secondsLeft)}
      </div>
      <Progress
        value={progress}
        className="w-3/4"
      />
      <div className="flex gap-2 mt-2">
        <Button
          onClick={toggle}
          size="lg"
        >
          {isActive ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          size="lg"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          setTempWorkMinutes(workMinutes);
          setTempBreakMinutes(breakMinutes);
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
            <DialogTitle>Pomodoro Settings</DialogTitle>
            <DialogDescription>
              Set the duration for your work and break sessions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSettingsSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor={`work-time-${widgetId}`}
                  className="text-right"
                >
                  Work
                </Label>
                <Input
                  id={`work-time-${widgetId}`}
                  type="number"
                  value={tempWorkMinutes}
                  onChange={(e) =>
                    setTempWorkMinutes(parseInt(e.target.value, 10))
                  }
                  className="col-span-3"
                  min="1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor={`break-time-${widgetId}`}
                  className="text-right"
                >
                  Break
                </Label>
                <Input
                  id={`break-time-${widgetId}`}
                  type="number"
                  value={tempBreakMinutes}
                  onChange={(e) =>
                    setTempBreakMinutes(parseInt(e.target.value, 10))
                  }
                  className="col-span-3"
                  min="1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

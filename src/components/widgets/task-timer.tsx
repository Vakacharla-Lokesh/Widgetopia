"use client";
import { useState, useEffect, useRef } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TaskTimerProps {
  widgetId: string;
}

export default function TaskTimer({ widgetId }: TaskTimerProps) {
  const [task, setTask] = useLocalStorage(`task-timer-task-${widgetId}`, "My Important Task");
  const [duration, setDuration] = useLocalStorage(`task-timer-duration-${widgetId}`, 15); // in minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);
  
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      if(timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleStartStop = () => {
    if (isCompleted) return;
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(duration * 60);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value, 10);
    if (!isNaN(newDuration) && newDuration > 0) {
        setDuration(newDuration);
        if(!isRunning) {
            setTimeLeft(newDuration * 60);
        }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-2">
        <Input 
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="text-md font-semibold text-center border-0 focus-visible:ring-0 bg-transparent"
            disabled={isRunning}
        />
        <div className="flex items-center gap-2">
            <Input
                type="number"
                value={duration}
                onChange={handleDurationChange}
                className="w-16 h-8 text-center"
                disabled={isRunning}
                min="1"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
        </div>
      <div className="text-5xl font-mono font-bold my-2" suppressHydrationWarning>
        {formatTime(timeLeft)}
      </div>
      <Progress value={isCompleted ? 100 : progress} className={`w-3/4 ${isCompleted ? 'bg-green-500' : ''}`} />
      <div className="flex gap-2 mt-2">
        <Button onClick={handleStartStop} size="default" disabled={isCompleted}>
          {isRunning ? <Pause className="h-5 w-5" /> : (isCompleted ? <Check className="h-5 w-5" /> : <Play className="h-5 w-5" />)}
        </Button>
        <Button onClick={handleReset} variant="outline" size="default">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

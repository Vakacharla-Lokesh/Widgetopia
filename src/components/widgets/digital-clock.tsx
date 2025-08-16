"use client";

import { useState, useEffect } from "react";

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-5xl font-mono font-semibold tracking-wider">
        {time.toLocaleTimeString()}
      </p>
    </div>
  );
}

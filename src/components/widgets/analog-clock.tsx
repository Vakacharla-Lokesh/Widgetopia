"use client";

import { useState, useEffect } from "react";

export default function AnalogClock() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();

      setTime({
        h: h * 30 + m / 2, // hour hand rotation
        m: m * 6, // minute hand rotation
        s: s * 6, // second hand rotation
      });
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-[200px] aspect-square">
        <div className="relative w-full h-full rounded-full border-4 border-primary/50 bg-background flex items-center justify-center">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-full"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div
                className={`absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full ${
                  i % 3 === 0 ? "bg-primary" : "bg-primary/50"
                }`}
              ></div>
            </div>
          ))}

          {/* Center dot */}
          <div className="absolute w-3 h-3 bg-primary rounded-full z-10"></div>

          {/* Hour hand */}
          <div
            className="absolute w-1.5 h-1/3 bottom-1/2 origin-bottom rounded-t-full bg-foreground"
            style={{ transform: `rotate(${time.h}deg)`, height: "25%" }}
          ></div>

          {/* Minute hand */}
          <div
            className="absolute w-1 h-1/2 bottom-1/2 origin-bottom rounded-t-full bg-foreground"
            style={{ transform: `rotate(${time.m}deg)`, height: "35%" }}
          ></div>

          {/* Second hand */}
          <div
            className="absolute w-0.5 h-1/2 bottom-1/2 origin-bottom rounded-t-full bg-primary"
            style={{ transform: `rotate(${time.s}deg)`, height: "40%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

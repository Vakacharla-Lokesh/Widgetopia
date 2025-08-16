"use client";

import React, { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grab, X } from "lucide-react";

interface WidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  onRemove: () => void;
}

const Widget = React.forwardRef<HTMLDivElement, WidgetProps>(
  ({ title, children, onRemove, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${className} group h-full w-full`}
        {...props}
      >
        <Card className="w-full h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 relative">
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="drag-handle cursor-move p-1.5 rounded-md bg-background/50 hover:bg-background/80">
              <Grab className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/50 hover:bg-background/80"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove widget</span>
            </Button>
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-center items-center h-full">
            {children}
          </CardContent>
        </Card>
      </div>
    );
  }
);

Widget.displayName = "Widget";
export default Widget;

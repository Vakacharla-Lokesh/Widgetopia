"use client";
import React, { useState } from "react";
import { WidthProvider, Responsive, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import useLocalStorage from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Clock,
  Timer,
  Hourglass,
  StickyNote,
  Plus,
  Maximize,
  Minimize,
  Settings,
  Calendar as CalendarIcon,
  ListTodo,
  CloudSun,
  PenTool,
  ClipboardCheck,
} from "lucide-react";
import Widget from "./widgets/widget";
import DigitalClock from "./widgets/digital-clock";
import AnalogClock from "./widgets/analog-clock";
import Stopwatch from "./widgets/stopwatch";
import Pomodoro from "./widgets/pomodoro";
import Notes from "./widgets/notes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import SettingsPanel from "./settings-panel";
import CalendarWidget from "./widgets/calendar";
import TodoList from "./widgets/todo-list";
import Weather from "./widgets/weather";
import Doodle from "./widgets/doodle";
import TaskTimer from "./widgets/task-timer";
import { useTheme } from "@/hooks/use-theme";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface WidgetItem {
  i: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

const WIDGET_COMPONENTS: { [key: string]: React.ComponentType<any> } = {
  "digital-clock": DigitalClock,
  "analog-clock": AnalogClock,
  stopwatch: Stopwatch,
  pomodoro: Pomodoro,
  notes: Notes,
  calendar: CalendarWidget,
  "todo-list": TodoList,
  weather: Weather,
  doodle: Doodle,
  "task-timer": TaskTimer,
};

const AVAILABLE_WIDGETS = [
  {
    type: "digital-clock",
    name: "Digital Clock",
    icon: <Clock className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 1 },
    preview: <DigitalClock />,
  },
  {
    type: "analog-clock",
    name: "Analog Clock",
    icon: <Clock className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 2, h: 4, minW: 2, minH: 4 },
    preview: <AnalogClock />,
  },
  {
    type: "stopwatch",
    name: "Stopwatch",
    icon: <Timer className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 2, h: 4, minW: 2, minH: 3 },
    preview: <Stopwatch />,
  },
  {
    type: "pomodoro",
    name: "Pomodoro Timer",
    icon: <Hourglass className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 2, h: 4, minW: 2, minH: 3 },
    preview: <Pomodoro />,
  },
  {
    type: "notes",
    name: "Notes",
    icon: <StickyNote className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 3 },
    preview: <Notes widgetId="preview" />,
  },
  {
    type: "calendar",
    name: "Calendar",
    icon: <CalendarIcon className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 3, h: 6, minW: 3, minH: 6 },
    preview: <CalendarWidget />,
  },
  {
    type: "todo-list",
    name: "To-Do List",
    icon: <ListTodo className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 3, h: 5, minW: 2, minH: 4 },
    preview: <TodoList widgetId="preview" />,
  },
  {
    type: "weather",
    name: "Weather",
    icon: <CloudSun className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 3 },
    preview: <Weather />,
  },
  {
    type: "doodle",
    name: "Doodle Pad",
    icon: <PenTool className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 4, h: 5, minW: 3, minH: 4 },
    preview: <Doodle widgetId="preview" />,
  },
  {
    type: "task-timer",
    name: "Task Timer",
    icon: <ClipboardCheck className="mr-2 h-4 w-4" />,
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 3 },
    preview: <TaskTimer widgetId="preview" />,
  },
];

export default function Dashboard() {
  const [widgets, setWidgets] = useLocalStorage<WidgetItem[]>("widgets", []);
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const { theme } = useTheme();

  React.useEffect(() => {
    setIsMounted(true);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const onLayoutChange = (newLayout: Layout[], layouts: { [key: string]: Layout[] }) => {
    if (JSON.stringify(layouts.lg) !== JSON.stringify(widgets.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })))) {
      setWidgets((prevWidgets) =>
        prevWidgets.map((widget) => {
          const layoutItem = newLayout.find((item) => item.i === widget.i);
          return layoutItem ? { ...widget, ...layoutItem } : widget;
        })
      );
    }
  };

  const addWidget = (type: string) => {
    const widgetConfig = AVAILABLE_WIDGETS.find((w) => w.type === type);
    if (!widgetConfig) return;

    const newWidget: WidgetItem = {
      i: `${type}-${Date.now()}`,
      type,
      x: (widgets.length * 2) % 12,
      y: Infinity, // This will be resolved by the grid layout
      ...widgetConfig.defaultLayout,
    };
    setWidgets([...widgets, newWidget]);
    setSidebarOpen(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.i !== id));
    if (id.startsWith("notes-")) {
      localStorage.removeItem(`notes-widget-${id}`);
    }
    if (id.startsWith("todo-list-")) {
      localStorage.removeItem(`todo-list-widget-${id}`);
    }
    if (id.startsWith("doodle-")) {
      localStorage.removeItem(`doodle-widget-${id}`);
    }
    if (id.startsWith("task-timer-")) {
      localStorage.removeItem(`task-timer-widget-${id}`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderWidget = (widget: WidgetItem) => {
    const Component = WIDGET_COMPONENTS[widget.type];
    const config = AVAILABLE_WIDGETS.find((w) => w.type === widget.type);
    if (!Component || !config) return null;

    return (
      <Widget
        title={config.name}
        onRemove={() => removeWidget(widget.i)}
        className="widget-fade-in"
      >
        <Component widgetId={widget.i} />
      </Widget>
    );
  };

  return (
    <>
      <style jsx global>{`
        body {
          background-image: ${theme.backgroundUrl ? `url(${theme.backgroundUrl})` : 'none'};
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .react-grid-layout {
          position: relative;
          transition: height 200ms ease;
        }
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
          z-index: 1;
        }
        .react-grid-item.cssTransforms {
          transition-property: transform;
        }
        .react-grid-item.resizing {
          z-index: 2;
          will-change: width, height;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 3;
          will-change: transform;
        }
        .react-grid-item.react-grid-placeholder {
          background: hsl(var(--primary) / 0.2);
          border-radius: var(--radius);
          transition-duration: 100ms;
          z-index: 0;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -o-user-select: none;
          user-select: none;
        }
        .react-grid-item.react-draggable-free {
            position: absolute;
        }
        .widget-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <header className={`p-4 flex justify-between items-center ${isFullscreen ? 'hidden' : ''}`}>
        <h1 className="text-2xl font-bold">Widgetopia</h1>
        <div className="flex items-center gap-2">
            <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Widget
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Add a new widget</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-grow">
                      <div className="grid gap-4 py-4 pr-4">
                          {AVAILABLE_WIDGETS.map((w) => (
                          <Card key={w.type} className="overflow-hidden">
                              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                                  <CardTitle className="text-base font-semibold flex items-center">
                                      {w.icon}
                                      <span>{w.name}</span>
                                  </CardTitle>
                                  <Button onClick={() => addWidget(w.type)}>
                                      <Plus className="mr-2 h-4 w-4" /> Add
                                  </Button>
                              </CardHeader>
                              <CardContent className="p-4 bg-muted/40 min-h-[120px] flex items-center justify-center">
                                  <div className="scale-75">{w.preview}</div>
                              </CardContent>
                          </Card>
                          ))}
                      </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
            
            <Sheet open={isSettingsOpen} onOpenChange={setSettingsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-grow">
                        <SettingsPanel />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <Button onClick={toggleFullscreen} variant="outline" size="icon">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                <span className="sr-only">Toggle fullscreen</span>
            </Button>
        </div>
      </header>
      <main className="p-4">
        {isMounted ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: widgets }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={50}
            onLayoutChange={onLayoutChange}
            draggableHandle=".drag-handle"
            isDraggable
            isResizable
            compactType="vertical"
            preventCollision={false}
          >
            {widgets.map((w) => (
              <div key={w.i}>{renderWidget(w)}</div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div className="text-center p-10">Loading Dashboard...</div>
        )}
        {isMounted && widgets.length === 0 && (
          <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg bg-background/50">
            <h2 className="text-xl font-semibold text-muted-foreground">Your dashboard is empty.</h2>
            <p className="text-muted-foreground mt-2">Click "Add Widget" to get started.</p>
          </div>
        )}
      </main>
    </>
  );
}
"use client";

import useLocalStorage from "@/hooks/use-local-storage";
import { Textarea } from "@/components/ui/textarea";

interface NotesProps {
  widgetId: string;
}

export default function Notes({ widgetId }: NotesProps) {
  const [note, setNote] = useLocalStorage(`notes-widget-${widgetId}`, "My new note...");

  return (
    <div className="w-full h-full">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your notes here..."
        className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base"
      />
    </div>
  );
}

import Dashboard from "@/components/dashboard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dashboard />
      <Toaster />
    </div>
  );
}

import Dashboard from "@/components/dashboard";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next"
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Analytics/>
      <Dashboard />
      <Toaster />
    </div>
  );
}

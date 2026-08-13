import { Component, ErrorInfo, ReactNode } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App render failed:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <section className="w-full max-w-xl text-center glass-gold rounded-3xl p-8 sm:p-10 shadow-luxury">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground glow-gold">
            <RefreshCw className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-gradient-gold mb-4">
            Astro With Hrishi
          </h1>
          <p className="text-cosmic-silver/80 mb-7 leading-relaxed">
            The page needs a quick refresh. You can also connect directly on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()} className="bg-gradient-gold text-primary-foreground">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button asChild variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
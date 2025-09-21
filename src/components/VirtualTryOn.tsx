import { useState } from "react";
import { Camera } from "./Camera";
import { GlassesSelector } from "./GlassesSelector";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sparkles, Camera as CameraIcon, Download } from "lucide-react";

export const VirtualTryOn = () => {
  const [selectedGlasses, setSelectedGlasses] = useState<string>("aviator");
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate capture delay
    setTimeout(() => setIsCapturing(false), 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Virtual Try-On</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Glasses Fitting</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-tech-surface border-tech-glow/20">
              <span className="w-2 h-2 bg-tech-glow rounded-full mr-2 animate-pulse"></span>
              Live Detection
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 p-6">
        {/* Main Camera View */}
        <div className="flex-1">
          <Card className="overflow-hidden bg-tech-surface border-tech-glow/20 shadow-[var(--shadow-elevated)]">
            <div className="relative">
              <Camera selectedGlasses={selectedGlasses} />
              
              {/* Camera Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="bg-primary hover:bg-primary/90 shadow-[var(--shadow-tech)]"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {isCapturing ? "Capturing..." : "Capture"}
                </Button>
                <Button variant="secondary" className="bg-tech-surface-hover border-border">
                  <Download className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Glasses Selector Sidebar */}
        <div className="w-80">
          <Card className="bg-tech-surface border-tech-glow/20 shadow-[var(--shadow-elevated)]">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Choose Your Style</h2>
              <GlassesSelector 
                selectedGlasses={selectedGlasses}
                onGlassesChange={setSelectedGlasses}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border bg-card/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Face Detection: Active</span>
              <span>•</span>
              <span>3D Rendering: Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-tech-glow rounded-full animate-pulse"></span>
              <span>Real-time tracking enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
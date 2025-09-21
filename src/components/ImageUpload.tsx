import { useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Upload, X, Camera as CameraIcon, Download } from "lucide-react";
import { GlassesModel } from "./GlassesModel";
import { useImageFaceTracking } from "@/hooks/useImageFaceTracking";
import { useImageCapture } from "@/hooks/useImageCapture";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  selectedGlasses: string;
  onBack: () => void;
}

export const ImageUpload = ({ selectedGlasses, onBack }: ImageUploadProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { landmarks, isDetecting } = useImageFaceTracking(imageRef);
  const { captureFromImage, downloadImage } = useImageCapture();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleCapture = useCallback(async () => {
    if (!imageRef.current) return;
    
    try {
      setIsProcessing(true);
      const capturedImage = await captureFromImage(imageRef.current);
      downloadImage(capturedImage, `glasses-tryona-${Date.now()}.png`);
    } catch (error) {
      toast({
        title: "Capture failed",
        description: "Could not capture the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [captureFromImage, downloadImage, toast]);

  const clearImage = useCallback(() => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          ← Back to Camera
        </Button>
        <Badge variant="secondary" className="bg-tech-surface border-tech-glow/20">
          <Upload className="w-3 h-3 mr-2" />
          Photo Mode
        </Badge>
      </div>

      <Card className="flex-1 overflow-hidden bg-tech-surface border-tech-glow/20 shadow-[var(--shadow-elevated)]">
        {!uploadedImage ? (
          // Upload Area
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-tech-glow/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-tech-glow" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Upload Your Photo
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload a clear photo of your face to try on glasses virtually
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90 shadow-[var(--shadow-tech)]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-4">
                Supports JPG, PNG, WEBP formats
              </p>
            </div>
          </div>
        ) : (
          // Image Preview with Glasses
          <div className="relative h-full">
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-full object-contain"
                onLoad={() => {
                  // Image loaded, face detection will be triggered automatically
                }}
              />

              {/* Face Detection Overlay - Remove since we don't need visual overlay for images */}

              {/* 3D Glasses Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <Canvas
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <PerspectiveCamera makeDefault position={[0, 0, 1]} />
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[0, 0, 1]} intensity={0.8} />
                  
                  {landmarks && (
                    <GlassesModel 
                      glassesType={selectedGlasses}
                      landmarks={landmarks}
                    />
                  )}
                </Canvas>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className={`backdrop-blur-sm ${
                  isDetecting ? 'bg-tech-glow/20 border-tech-glow/40' : 'bg-tech-surface/80'
                }`}>
                  {isDetecting ? (
                    <>
                      <div className="w-2 h-2 bg-tech-glow rounded-full mr-2 animate-pulse"></div>
                      Face Detected
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2"></div>
                      Analyzing...
                    </>
                  )}
                </Badge>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button
                  onClick={handleCapture}
                  disabled={isProcessing || !isDetecting}
                  className="bg-primary hover:bg-primary/90 shadow-[var(--shadow-tech)]"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Capture"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={clearImage}
                  className="bg-tech-surface-hover border-border"
                >
                  <X className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Processing image...</p>
          </div>
        </div>
      )}
    </div>
  );
};
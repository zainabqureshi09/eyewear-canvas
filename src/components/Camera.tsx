import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { FaceDetection } from "./FaceDetection";
import { GlassesModel } from "./GlassesModel";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { Badge } from "./ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface CameraProps {
  selectedGlasses: string;
}

export interface CameraRef {
  captureImage: () => Promise<string>;
  getVideoElement: () => HTMLVideoElement | null;
}

export const Camera = forwardRef<CameraRef, CameraProps>(({ selectedGlasses }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  
  const { landmarks, isDetecting, isLoading: faceTrackingLoading, performance } = useFaceTracking(videoRef);

  useImperativeHandle(ref, () => ({
    captureImage: async () => {
      if (!videoRef.current) {
        throw new Error('Video not available');
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Draw the mirrored video frame
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      return canvas.toDataURL('image/png');
    },
    getVideoElement: () => videoRef.current
  }), []);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraLoading(false);
      } catch (err) {
        setError("Camera access denied. Please enable camera permissions.");
        setCameraLoading(false);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }}
      />

      {/* Face Detection Overlay */}
      <FaceDetection videoRef={videoRef} />

      {/* 3D Glasses Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 1], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: false, // Disable for better performance
            powerPreference: "high-performance"
          }}
        >
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          
          {landmarks && !faceTrackingLoading && (
            <GlassesModel 
              landmarks={landmarks} 
              glassesType={selectedGlasses}
            />
          )}
        </Canvas>

        {/* Enhanced Detection Status Overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-tech-surface/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-tech-glow/20">
          <div className={`w-2 h-2 rounded-full ${
            faceTrackingLoading ? 'bg-yellow-500 animate-pulse' :
            isDetecting ? 'bg-tech-glow animate-pulse' : 'bg-muted-foreground'
          }`} />
          <span className="text-sm text-foreground">
            {faceTrackingLoading ? 'Initializing...' :
             isDetecting ? 'Face Detected' : 'Looking for face...'}
          </span>
        </div>

        {/* Performance Monitor */}
        <div className="absolute top-4 right-4 bg-tech-surface/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-tech-glow/20">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>FPS: <span className="text-tech-glow">{performance.fps}</span></div>
            <div>Latency: <span className="text-tech-glow">{performance.processingTime}ms</span></div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {cameraLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Starting camera...</p>
            <p className="text-muted-foreground text-sm">Please allow camera access</p>
          </div>
        </div>
      )}
    </div>
  );
});
import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { FaceDetection } from "./FaceDetection";
import { GlassesModel } from "./GlassesModel";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { Badge } from "./ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface CameraProps {
  selectedGlasses: string;
}

export const Camera = ({ selectedGlasses }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { landmarks, isDetecting } = useFaceTracking(videoRef);

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
        setIsLoading(false);
      } catch (err) {
        setError("Camera access denied. Please enable camera permissions.");
        setIsLoading(false);
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
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)' // Mirror to match video
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

      {/* Status Indicators */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {isLoading && (
          <Badge variant="secondary" className="bg-tech-surface/80 backdrop-blur-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
            Initializing...
          </Badge>
        )}
        
        {error && (
          <Badge variant="destructive" className="bg-destructive/80 backdrop-blur-sm">
            <AlertCircle className="w-3 h-3 mr-2" />
            Camera Error
          </Badge>
        )}
        
        {!error && !isLoading && (
          <Badge variant="secondary" className={`backdrop-blur-sm ${
            isDetecting ? 'bg-tech-glow/20 border-tech-glow/40' : 'bg-tech-surface/80'
          }`}>
            {isDetecting ? (
              <>
                <CheckCircle className="w-3 h-3 mr-2 text-tech-glow" />
                Face Detected
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2"></div>
                Looking for face...
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
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
};
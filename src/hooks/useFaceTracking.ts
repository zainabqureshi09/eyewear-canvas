import { useEffect, useState, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";

export interface FaceLandmarks {
  leftEye: { x: number; y: number; z: number };
  rightEye: { x: number; y: number; z: number };
  noseTip: { x: number; y: number; z: number };
  jawline: Array<{ x: number; y: number; z: number }>;
  forehead: { x: number; y: number; z: number };
}

export const useFaceTracking = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [performance, setPerformance] = useState({ fps: 0, processingTime: 0 });
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const lastProcessTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!videoRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    // Optimized settings for better performance
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false, // Disable for better performance
      minDetectionConfidence: 0.5, // Lower threshold for faster detection
      minTrackingConfidence: 0.3  // Lower for smoother tracking
    });

    faceMesh.onResults((results) => {
      const currentTime = Date.now();
      const processingTime = currentTime - lastProcessTime.current;
      
      // Update performance metrics
      frameCount.current++;
      const elapsed = (currentTime - startTime.current) / 1000;
      const fps = frameCount.current / elapsed;
      
      setPerformance({ fps: Math.round(fps), processingTime });
      
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const faceLandmarks = results.multiFaceLandmarks[0];
        
        // Extract key landmarks for glasses positioning (optimized indices)
        const leftEyeCenter = faceLandmarks[468] || faceLandmarks[33]; // Fallback to outer corner
        const rightEyeCenter = faceLandmarks[473] || faceLandmarks[263]; // Fallback to outer corner
        const noseTip = faceLandmarks[1] || faceLandmarks[2]; // Fallback to nose bridge
        const forehead = faceLandmarks[10] || faceLandmarks[151]; // Fallback
        
        // Simplified jawline for better performance (fewer points)
        const jawlineIndices = [172, 136, 150, 176, 400, 378, 397, 288, 361, 323];
        const jawline = jawlineIndices.map(index => faceLandmarks[index]).filter(Boolean);

        setLandmarks({
          leftEye: leftEyeCenter,
          rightEye: rightEyeCenter,
          noseTip: noseTip,
          jawline: jawline,
          forehead: forehead
        });
        
        setIsDetecting(true);
        setIsLoading(false);
      } else {
        setIsDetecting(false);
        if (!isLoading) {
          setLandmarks(null);
        }
      }
      
      lastProcessTime.current = currentTime;
    });

    faceMeshRef.current = faceMesh;

    // Initialize camera with optimized settings
    const camera = new MediaPipeCamera(videoRef.current, {
      onFrame: async () => {
        // Throttle processing to improve performance (process every 3rd frame)
        if (frameCount.current % 3 === 0 && videoRef.current && faceMeshRef.current) {
          lastProcessTime.current = Date.now();
          await faceMeshRef.current.send({ image: videoRef.current });
        }
        frameCount.current++;
      },
      width: 640,  // Reduced resolution for better performance
      height: 480  // Reduced resolution for better performance
    });
    
    cameraRef.current = camera;
    camera.start();

    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
      if (cameraRef.current) {
        // Note: MediaPipe camera doesn't have a standard stop method
        // The cleanup happens when the component unmounts
      }
    };
  }, [videoRef]);

  return {
    landmarks,
    isDetecting,
    isLoading,
    performance
  };
};
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
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const faceLandmarks = results.multiFaceLandmarks[0];
        
        // Extract key landmarks for glasses positioning
        const leftEyeCenter = faceLandmarks[468]; // Left eye center
        const rightEyeCenter = faceLandmarks[473]; // Right eye center
        const noseTip = faceLandmarks[1]; // Nose tip
        const forehead = faceLandmarks[10]; // Forehead center
        
        // Extract jawline points for face shape analysis
        const jawlineIndices = [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323];
        const jawline = jawlineIndices.map(index => faceLandmarks[index]);

        setLandmarks({
          leftEye: leftEyeCenter,
          rightEye: rightEyeCenter,
          noseTip: noseTip,
          jawline: jawline,
          forehead: forehead
        });
        
        setIsDetecting(true);
      } else {
        setIsDetecting(false);
        setLandmarks(null);
      }
    });

    faceMeshRef.current = faceMesh;

    // Initialize camera
    const camera = new MediaPipeCamera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && faceMeshRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720
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
    isDetecting
  };
};
import { useEffect, useState, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { FaceLandmarks } from "./useFaceTracking";

export const useImageFaceTracking = (imageRef: React.RefObject<HTMLImageElement>) => {
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const faceMeshRef = useRef<FaceMesh | null>(null);

  useEffect(() => {
    if (!imageRef.current || !imageRef.current.complete) return;

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

    // Process the image
    const processImage = async () => {
      if (imageRef.current && faceMeshRef.current) {
        await faceMeshRef.current.send({ image: imageRef.current });
      }
    };

    processImage();

    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, [imageRef.current?.src]); // Re-run when image source changes

  return {
    landmarks,
    isDetecting
  };
};
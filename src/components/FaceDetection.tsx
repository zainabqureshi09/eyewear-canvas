import { useEffect, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";

interface FaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const FaceDetection = ({ videoRef }: FaceDetectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // Draw key face landmarks for debugging
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#00ffff';

        // Draw eye landmarks
        const leftEye = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
        const rightEye = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

        // Draw eye contours
        [leftEye, rightEye].forEach(eye => {
          ctx.beginPath();
          eye.forEach((index, i) => {
            const landmark = landmarks[index];
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.closePath();
          ctx.stroke();
        });

        // Draw nose tip
        const noseTip = landmarks[1];
        ctx.beginPath();
        ctx.arc(
          noseTip.x * canvas.width,
          noseTip.y * canvas.height,
          3,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });

    faceMeshRef.current = faceMesh;

    // Initialize camera
    if (videoRef.current) {
      const camera = new MediaPipeCamera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720
      });
      camera.start();
    }

    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, [videoRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      const resizeCanvas = () => {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
      };
      
      video.addEventListener('loadedmetadata', resizeCanvas);
      resizeCanvas();
      
      return () => {
        video.removeEventListener('loadedmetadata', resizeCanvas);
      };
    }
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
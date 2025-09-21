import { useRef, useCallback } from "react";
import { useToast } from "./use-toast";

export const useImageCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const captureFromVideo = useCallback((
    videoElement: HTMLVideoElement,
    glassesCanvas?: HTMLCanvasElement
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas dimensions to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Draw the video frame (mirrored)
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, -canvas.width, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // If glasses overlay exists, draw it on top
        if (glassesCanvas) {
          ctx.drawImage(glassesCanvas, 0, 0, canvas.width, canvas.height);
        }

        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const captureFromImage = useCallback((
    imageElement: HTMLImageElement,
    glassesCanvas?: HTMLCanvasElement
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas dimensions to match image
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;

        // Draw the image
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        // If glasses overlay exists, draw it on top
        if (glassesCanvas) {
          ctx.drawImage(glassesCanvas, 0, 0, canvas.width, canvas.height);
        }

        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const downloadImage = useCallback((dataURL: string, filename: string = 'glasses-try-on.png') => {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Image saved!",
        description: "Your try-on photo has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save the image. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    captureFromVideo,
    captureFromImage,
    downloadImage,
    canvasRef
  };
};
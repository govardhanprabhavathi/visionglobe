import React, { useEffect, useRef } from 'react';
import { initializeHandTracking } from '../lib/handTracking';
import { processLandmarks } from '../lib/gestureDetection';
import { useGlobeStore } from '../lib/store';

export const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  
  const setHandPosition = useGlobeStore((state) => state.setHandPosition);
  const setDistance = useGlobeStore((state) => state.setDistance);
  const setIsFist = useGlobeStore((state) => state.setIsFist);
  const setTrackingActive = useGlobeStore((state) => state.setTrackingActive);
  const setSpinDelta = useGlobeStore((state) => state.setSpinDelta);

  const lastHand2Position = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    let landmarker: any = null;
    let lastVideoTime = -1;

    const startCamera = async () => {
      try {
        landmarker = await initializeHandTracking();
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    const predictWebcam = () => {
      if (!videoRef.current || !landmarker) return;

      const startTimeMs = performance.now();
      
      // Predict only if the video frame has updated
      if (lastVideoTime !== videoRef.current.currentTime) {
        lastVideoTime = videoRef.current.currentTime;
        const results = landmarker.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          setTrackingActive(true);
          const gestureState = processLandmarks(results.landmarks);
          setHandPosition(gestureState.handPosition);
          setIsFist(gestureState.isFist);
          // 1. Zoom Logic
          if (gestureState.distance !== null) {
            setDistance(Math.max(0.5, gestureState.distance * 3));
          }
          
          // 2. Spin Logic
          if (gestureState.hand2Position) {
            if (lastHand2Position.current) {
              const dx = gestureState.hand2Position.x - lastHand2Position.current.x;
              const dy = gestureState.hand2Position.y - lastHand2Position.current.y;
              setSpinDelta({ x: -dx * 10, y: -dy * 10 });
            }
            lastHand2Position.current = gestureState.hand2Position;
          } else {
            lastHand2Position.current = null;
            setSpinDelta({ x: 0, y: 0 });
          }
        } else {
          setTrackingActive(false);
          setHandPosition(null);
        }
      }
      
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    startCamera();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
      />
    </div>
  );
};

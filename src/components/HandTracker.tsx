import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useGlobeStore } from '../store';
import { Camera, CameraOff, Sparkles, Loader } from 'lucide-react';

export const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isTracking,
    trackingStatus,
    trackingError,
    setIsTracking,
    setTrackingStatus,
    setTrackingError,
    setActiveGesture,
    updateCameraRotation,
    setZoomFactor,
    zoomFactor,
    autoRotate,
    setAutoRotate
  } = useGlobeStore();

  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousHandPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize MediaPipe Gesture Recognizer
  useEffect(() => {
    let active = true;
    
    const initGestureRecognizer = async () => {
      try {
        setTrackingStatus('loading');
        
        // Load WASM files from CDN for zero deployment issues
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
        );
        
        if (!active) return;

        // Create Gesture Recognizer
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1
        });

        if (!active) {
          recognizer.close();
          return;
        }

        gestureRecognizerRef.current = recognizer;
        setTrackingStatus('idle');
      } catch (err: unknown) {
        console.error('Failed to initialize MediaPipe:', err);
        if (active) {
          setTrackingStatus('error');
          setTrackingError('Failed to load MediaPipe gesture recognition models.');
        }
      }
    };

    initGestureRecognizer();

    return () => {
      active = false;
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
      }
    };
  }, [setTrackingStatus, setTrackingError]);

  // Handle webcam toggle
  const toggleCamera = async () => {
    if (isTracking) {
      // Stop tracking
      stopTracking();
    } else {
      // Start tracking
      try {
        setTrackingError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        setActiveStream(stream);
        setIsTracking(true);
        setTrackingStatus('active');
      } catch (err: unknown) {
        console.error('Webcam access error:', err);
        setTrackingError('Unable to access webcam. Please check permissions.');
        setIsTracking(false);
        setTrackingStatus('error');
      }
    }
  };

  const stopTracking = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    setIsTracking(false);
    setActiveGesture('None');
    previousHandPosRef.current = null;
    if (trackingStatus !== 'error') {
      setTrackingStatus('idle');
    }
  };

  // Run the detection loop
  useEffect(() => {
    if (!isTracking || !videoRef.current || !gestureRecognizerRef.current) return;

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const recognizer = gestureRecognizerRef.current;

      if (!video || !canvas || !recognizer || video.readyState < 2) {
        requestRef.current = requestAnimationFrame(detect);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Sync canvas dimensions with video
      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // MediaPipe requires milliseconds timestamp
      const timestamp = performance.now();
      
      try {
        const results = recognizer.recognizeForVideo(video, timestamp);
        
        // If hand landmarks are detected, draw and process them
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const gesture = results.gestures && results.gestures[0] && results.gestures[0][0];
          const gestureName = gesture ? gesture.categoryName : 'None';
          
          setActiveGesture(gestureName);
          
          // Draw skeleton overlay
          drawSkeleton(ctx, landmarks);

          // Get hand center (wrist landmark 0 and middle finger mcp landmark 9)
          const wrist = landmarks[0];
          const knuckle = landmarks[9];
          const centerX = (wrist.x + knuckle.x) / 2;
          const centerY = (wrist.y + knuckle.y) / 2;

          // Map gestures to actions
          if (gestureName === 'Open_Palm') {
            // Turn off autoRotate on interaction
            if (autoRotate) setAutoRotate(false);
            
            // Track movements to rotate the globe (mirroring X-axis for webcam)
            if (previousHandPosRef.current) {
              const dx = (centerX - previousHandPosRef.current.x) * 4.0; // scale factor
              const dy = (centerY - previousHandPosRef.current.y) * 4.0;
              updateCameraRotation(-dx, dy); // rotate globe
            }
            previousHandPosRef.current = { x: centerX, y: centerY };
          } else if (gestureName === 'Closed_Fist') {
            // Closed fist - zoom in/out based on hand height changes
            if (previousHandPosRef.current) {
              const dy = (centerY - previousHandPosRef.current.y);
              // Moving hand UP (lower Y value in screen coordinates) zooms IN (smaller zoom factor means closer in this formula or we adjust zoomFactor)
              const newZoom = zoomFactor - dy * 3.0;
              setZoomFactor(newZoom);
            }
            previousHandPosRef.current = { x: centerX, y: centerY };
          } else {
            // Reset previous hand reference when gesture is not panning/zooming
            previousHandPosRef.current = null;
          }
        } else {
          setActiveGesture('None');
          previousHandPosRef.current = null;
        }
      } catch (err) {
        console.error('Detection loop error:', err);
      }

      requestRef.current = requestAnimationFrame(detect);
    };

    requestRef.current = requestAnimationFrame(detect);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isTracking, setActiveGesture, updateCameraRotation, setZoomFactor, zoomFactor, autoRotate, setAutoRotate]);

  // MediaPipe hand connection indexes
  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // index
    [9, 10], [10, 11], [11, 12],     // middle
    [13, 14], [14, 15], [15, 16],    // ring
    [0, 17], [17, 18], [18, 19], [19, 20], // pinky
    [5, 9], [9, 13], [13, 17]        // palm
  ];

  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: { x: number; y: number }[]) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Draw connection lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#38bdf8';

    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      // Mirror X coordinates for webcam natural mapping
      const sx = (1 - start.x) * width;
      const sy = start.y * height;
      const ex = (1 - end.x) * width;
      const ey = end.y * height;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    });

    // Draw joints
    ctx.fillStyle = '#ec4899';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ec4899';
    
    landmarks.forEach((landmark) => {
      const x = (1 - landmark.x) * width;
      const y = landmark.y * height;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  return (
    <div className="glass-panel dashboard-panel hud-border p-4 flex flex-col gap-4 relative overflow-hidden" style={{ minHeight: '260px' }}>
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <h2 className="text-cyber title-glow font-bold text-sm tracking-wider">Vision Engine</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`pulse-dot ${isTracking ? 'bg-emerald' : 'bg-zinc-500'}`} style={{ backgroundColor: isTracking ? 'var(--emerald)' : 'var(--text-muted)' }}></div>
          <span className="text-[10px] text-cyber text-text-secondary">
            {isTracking ? 'TRACKING ACTIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Video / Camera viewport */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
        {!isTracking && (
          <div className="flex flex-col items-center gap-2 text-zinc-500 text-center p-4">
            <CameraOff className="w-8 h-8 opacity-40 mb-1" />
            <p className="text-xs font-semibold">Webcam Feed Inactive</p>
            <p className="text-[10px] max-w-[200px] text-text-muted">Activate tracking to control the 3D globe with hand gestures</p>
          </div>
        )}

        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
          playsInline
          muted
          style={{ display: isTracking ? 'block' : 'none' }}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ display: isTracking ? 'block' : 'none' }}
        />

        {trackingStatus === 'loading' && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2">
            <Loader className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-xs text-cyber text-sky-400">Loading Vision Models...</p>
          </div>
        )}
      </div>

      {trackingError && (
        <div className="text-[11px] text-red-400 bg-red-950/30 border border-red-500/20 rounded p-2 text-center">
          {trackingError}
        </div>
      )}

      {/* Controller Buttons */}
      <div className="flex gap-2">
        <button
          onClick={toggleCamera}
          disabled={trackingStatus === 'loading'}
          className={`glass-button flex-1 justify-center ${isTracking ? 'active' : ''}`}
        >
          {isTracking ? (
            <>
              <CameraOff className="w-4 h-4" />
              <span>Disable Tracking</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Enable Gestures</span>
            </>
          )}
        </button>
      </div>

      {/* Guide details */}
      {isTracking && (
        <div className="bg-white/5 border border-white/5 rounded p-2 text-[10px] text-text-secondary flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Open Palm:</span>
            <span className="text-sky-400 font-semibold">Hover & Drag to Rotate</span>
          </div>
          <div className="flex justify-between">
            <span>Closed Fist:</span>
            <span className="text-pink-400 font-semibold">Move Up/Down to Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};

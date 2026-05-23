import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarker: HandLandmarker | null = null;
let isInitializing = false;

export const initializeHandTracking = async () => {
  if (handLandmarker || isInitializing) return handLandmarker;
  
  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    
    console.log('Hand tracking initialized');
    return handLandmarker;
  } catch (error) {
    console.error('Failed to initialize hand tracking:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

export const getHandLandmarker = () => handLandmarker;

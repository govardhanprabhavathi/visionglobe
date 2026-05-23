import { distance } from '../utils/smoothing';

export type Landmark = { x: number; y: number; z: number };

const isTwoFingersRaised = (hand: Landmark[]) => {
  // Index and Middle are raised if their tips are higher (y is smaller) than their PIP joints
  const isIndexRaised = hand[8].y < hand[6].y;
  const isMiddleRaised = hand[12].y < hand[10].y;
  
  // Ring and Pinky should be folded
  const isRingFolded = hand[16].y > hand[14].y;
  const isPinkyFolded = hand[20].y > hand[18].y;

  return isIndexRaised && isMiddleRaised && isRingFolded && isPinkyFolded;
};

export const processLandmarks = (landmarks: Landmark[][]) => {
  if (!landmarks || landmarks.length === 0) {
    return {
      handPosition: null,
      isFist: false,
      distance: null,
      hand2Position: null,
    };
  }

  // Hand 1 (Primary Hand)
  const hand1 = landmarks[0];
  
  // Use wrist (0) or middle finger MCP (9) for the globe position
  // We'll use 9 (palm center roughly)
  const handPosition = { x: hand1[9].x, y: hand1[9].y, z: hand1[9].z };

  // Detect Fist
  // A simple heuristic: check if fingertips (8, 12, 16, 20) are below their respective PIP joints (6, 10, 14, 18)
  // In Mediapipe, y goes down (0 is top, 1 is bottom)
  // So if fingertip y > PIP y, it is folded.
  const isIndexFolded = hand1[8].y > hand1[6].y;
  const isMiddleFolded = hand1[12].y > hand1[10].y;
  const isRingFolded = hand1[16].y > hand1[14].y;
  const isPinkyFolded = hand1[20].y > hand1[18].y;
  
  // Also check if they are close to the palm to avoid false positives when pointing down
  const isFist = isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded;

  // Hand 2 (Secondary Hand) - for Zoom and Spin
  let twoHandDistance = null;
  let hand2Position = null;
  if (landmarks.length > 1) {
    const hand2 = landmarks[1];
    hand2Position = { x: hand2[9].x, y: hand2[9].y, z: hand2[9].z };
    
    // Zoom only happens if both hands have the "peace sign" / two fingers raised
    const hand1Peace = isTwoFingersRaised(hand1);
    const hand2Peace = isTwoFingersRaised(hand2);
    
    if (hand1Peace && hand2Peace) {
      twoHandDistance = distance(hand1[9].x, hand1[9].y, hand2[9].x, hand2[9].y);
    }
  }

  return {
    handPosition,
    isFist,
    distance: twoHandDistance,
    hand2Position,
  };
};

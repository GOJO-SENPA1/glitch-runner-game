export interface Hand {
  landmarks: Array<[number, number, number]>
  handedness: 'Right' | 'Left'
}

export interface ProcessedGesture {
  handDetected: boolean
  handX: number // normalized 0-1
  handY: number // normalized 0-1
  isFist: boolean
  confidence: number
}

export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_MCP: 1,
  THUMB_PIP: 2,
  THUMB_TIP: 3,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_TIP: 20,
}

export function detectFist(hand: Hand): boolean {
  // Fist is detected when all fingertips are below their MCPs (closed fist)
  const indexOpen = hand.landmarks[HAND_LANDMARKS.INDEX_TIP][1] < hand.landmarks[HAND_LANDMARKS.INDEX_MCP][1]
  const middleOpen = hand.landmarks[HAND_LANDMARKS.MIDDLE_TIP][1] < hand.landmarks[HAND_LANDMARKS.MIDDLE_MCP][1]
  const ringOpen = hand.landmarks[HAND_LANDMARKS.RING_TIP][1] < hand.landmarks[HAND_LANDMARKS.RING_MCP][1]
  const pinkyOpen = hand.landmarks[HAND_LANDMARKS.PINKY_TIP][1] < hand.landmarks[HAND_LANDMARKS.PINKY_MCP][1]
  
  // All fingers must be curled (closed) for a fist
  return !indexOpen && !middleOpen && !ringOpen && !pinkyOpen
}

export function processHand(hand: Hand, canvasWidth: number, canvasHeight: number): ProcessedGesture {
  const wrist = hand.landmarks[HAND_LANDMARKS.WRIST]
  
  // Normalize wrist position to 0-1 range
  let handX = wrist[0]
  let handY = wrist[1]
  
  // Account for camera being mirrored
  handX = 1 - handX
  
  const isFist = detectFist(hand)
  
  return {
    handDetected: true,
    handX,
    handY,
    isFist,
    confidence: hand.landmarks[0][2] || 0.8, // Use Z coordinate as confidence
  }
}

export function smoothGesture(
  current: ProcessedGesture,
  previous: ProcessedGesture | null,
  smoothingFactor: number = 0.7
): ProcessedGesture {
  if (!previous) return current
  
  return {
    ...current,
    handX: previous.handX * smoothingFactor + current.handX * (1 - smoothingFactor),
    handY: previous.handY * smoothingFactor + current.handY * (1 - smoothingFactor),
  }
}

export function detectLaneFromHand(handX: number): number {
  // 0 = left (0-0.33), 1 = center (0.33-0.66), 2 = right (0.66-1)
  if (handX < 0.33) return 0
  if (handX < 0.66) return 1
  return 2
}

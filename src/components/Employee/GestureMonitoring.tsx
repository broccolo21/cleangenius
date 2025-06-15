import React, { useRef, useEffect, useState } from 'react';
import { Hand, Eye, AlertTriangle, CheckCircle, Camera, Square } from 'lucide-react';

// Declare MediaPipe globals
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

export function GestureMonitoring() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [handsDetected, setHandsDetected] = useState(0);
  const [gestureStatus, setGestureStatus] = useState<'correct' | 'incorrect' | 'none'>('none');
  const [detectedGestures, setDetectedGestures] = useState<string[]>([]);
  
  // MediaPipe instances
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    // Initialize MediaPipe when component mounts
    if (typeof window !== 'undefined' && window.Hands) {
      initializeMediaPipe();
    }

    return () => {
      // Cleanup camera when component unmounts
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  const initializeMediaPipe = () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    
    if (!videoElement || !canvasElement) return;

    // Initialize MediaPipe Hands
    handsRef.current = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    // Configure Hands model
    handsRef.current.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    // Set up results callback
    handsRef.current.onResults(onResults);

    // Initialize camera
    cameraRef.current = new window.Camera(videoElement, {
      onFrame: async () => {
        if (handsRef.current && isActive) {
          await handsRef.current.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });
  };

  const onResults = (results: any) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) return;

    // Set canvas size
    canvasElement.width = 640;
    canvasElement.height = 480;

    // Clear canvas with transparent background
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Set black background for better visibility
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Update hands count
    setHandsDetected(results.multiHandLandmarks ? results.multiHandLandmarks.length : 0);

    if (results.multiHandLandmarks) {
      // Analyze gestures and draw landmarks
      const gestures = analyzeGestures(results.multiHandLandmarks, results.multiHandedness);
      setDetectedGestures(gestures);
      
      // Determine gesture status for cleaning procedures
      const status = evaluateCleaningGesture(gestures);
      setGestureStatus(status);

      // Draw hand landmarks and connections
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i];
        
        // Choose color based on hand (left/right)
        const isRightHand = handedness.label === 'Right';
        const connectionColor = isRightHand ? '#00FF00' : '#FF6B6B';
        const landmarkColor = isRightHand ? '#00AA00' : '#CC5555';

        // Draw hand connections
        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
          color: connectionColor,
          lineWidth: 2
        });

        // Draw hand landmarks
        window.drawLandmarks(canvasCtx, landmarks, {
          color: landmarkColor,
          lineWidth: 1,
          radius: 3
        });

        // Log landmarks for debugging (only first hand)
        if (i === 0) {
          console.log(`Hand ${handedness.label} landmarks:`, landmarks.slice(0, 5));
        }
      }
    }
  };

  const analyzeGestures = (multiHandLandmarks: any[], multiHandedness: any[]) => {
    const gestures: string[] = [];

    for (let i = 0; i < multiHandLandmarks.length; i++) {
      const landmarks = multiHandLandmarks[i];
      const handedness = multiHandedness[i];
      
      // Analyze finger positions for cleaning gestures
      const fingerStates = getFingerStates(landmarks);
      const gesture = classifyCleaningGesture(fingerStates, handedness.label);
      
      if (gesture) {
        gestures.push(`${handedness.label}: ${gesture}`);
      }
    }

    return gestures;
  };

  const getFingerStates = (landmarks: any[]) => {
    // MediaPipe hand landmark indices
    const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
    const fingerPips = [3, 6, 10, 14, 18]; // Previous joints
    
    const fingerStates = [];
    
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = landmarks[fingerTips[i]];
      const pip = landmarks[fingerPips[i]];
      
      // Simple up/down detection based on y-coordinate
      const isUp = tip.y < pip.y;
      fingerStates.push(isUp);
    }
    
    return fingerStates;
  };

  const classifyCleaningGesture = (fingerStates: boolean[], handLabel: string) => {
    const [thumb, index, middle, ring, pinky] = fingerStates;
    
    // Cleaning gesture patterns
    if (index && middle && !ring && !pinky) {
      return 'Spraying Motion';
    } else if (index && !middle && !ring && !pinky) {
      return 'Pointing/Directing';
    } else if (thumb && index && middle && ring && pinky) {
      return 'Open Hand - Wiping';
    } else if (!thumb && !index && !middle && !ring && !pinky) {
      return 'Closed Fist - Gripping';
    } else if (thumb && index && !middle && !ring && !pinky) {
      return 'Pinch Grip - Precision';
    }
    
    return 'Unknown Gesture';
  };

  const evaluateCleaningGesture = (gestures: string[]) => {
    // Define correct cleaning gestures
    const correctGestures = [
      'Spraying Motion',
      'Open Hand - Wiping',
      'Pinch Grip - Precision'
    ];
    
    const hasCorrectGesture = gestures.some(gesture => 
      correctGestures.some(correct => gesture.includes(correct))
    );
    
    if (gestures.length === 0) return 'none';
    return hasCorrectGesture ? 'correct' : 'incorrect';
  };

  const startMonitoring = async () => {
    try {
      if (cameraRef.current) {
        await cameraRef.current.start();
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      alert('Impossibile accedere alla fotocamera. Verifica i permessi.');
    }
  };

  const stopMonitoring = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      setIsActive(false);
      setHandsDetected(0);
      setGestureStatus('none');
      setDetectedGestures([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Monitoraggio Gesti</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitora i gesti corretti durante le procedure di pulizia
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Hand className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Mani Rilevate</p>
              <p className="text-2xl font-bold text-gray-900">{handsDetected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Stato Monitoraggio</p>
              <p className="text-lg font-semibold text-gray-900">
                {isActive ? 'Attivo' : 'Inattivo'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            {gestureStatus === 'correct' ? (
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            ) : gestureStatus === 'incorrect' ? (
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            ) : (
              <Square className="h-8 w-8 text-gray-400 mr-3" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Gesto</p>
              <p className={`text-lg font-semibold ${
                gestureStatus === 'correct' ? 'text-green-600' :
                gestureStatus === 'incorrect' ? 'text-red-600' : 'text-gray-400'
              }`}>
                {gestureStatus === 'correct' ? 'Corretto' :
                 gestureStatus === 'incorrect' ? 'Scorretto' : 'Nessuno'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Interface */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Feed Webcam & Rilevamento</h3>
            <div className="flex space-x-2">
              {!isActive ? (
                <button
                  onClick={startMonitoring}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Avvia Monitoraggio
                </button>
              ) : (
                <button
                  onClick={stopMonitoring}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Ferma Monitoraggio
                </button>
              )}
            </div>
          </div>

          {/* Video and Canvas Container */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* Video element for webcam feed */}
            <video
              ref={videoRef}
              className="input_video w-full h-96 object-cover"
              autoPlay
              muted
              playsInline
            />
            
            {/* Canvas overlay for hand landmarks */}
            <canvas
              ref={canvasRef}
              className="output_canvas absolute top-0 left-0 w-full h-full"
              style={{ background: 'transparent' }}
            />
          </div>
        </div>
      </div>

      {/* Detected Gestures */}
      {detectedGestures.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gesti Rilevati</h3>
            <div className="space-y-2">
              {detectedGestures.map((gesture, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-900">{gesture}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    gesture.includes('Spraying') || gesture.includes('Wiping') || gesture.includes('Precision')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {gesture.includes('Spraying') || gesture.includes('Wiping') || gesture.includes('Precision')
                      ? 'Corretto'
                      : 'Neutro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-800 mb-3">Gesti di Pulizia Monitorati:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h5 className="font-medium mb-2">✅ Gesti Corretti:</h5>
            <ul className="space-y-1">
              <li>• Movimento di spruzzatura (2 dita)</li>
              <li>• Mano aperta per strofinare</li>
              <li>• Presa di precisione (pollice + indice)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">ℹ️ Altri Gesti:</h5>
            <ul className="space-y-1">
              <li>• Pugno chiuso per afferrare</li>
              <li>• Puntamento/direzione</li>
              <li>• Gesti non classificati</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Il sistema monitora i gesti in tempo reale per validare le procedure di pulizia. 
            I landmark delle mani vengono disegnati in verde (mano destra) e rosso (mano sinistra).
          </p>
        </div>
      </div>
    </div>
  );
}
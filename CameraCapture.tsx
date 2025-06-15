import React, { useState, useRef } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Video, Upload, Trash2, Play, Pause } from 'lucide-react';

export function CameraCapture() {
  const { addMediaFile } = useAppData();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{
    type: 'photo' | 'video';
    url: string;
    caption: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Impossibile accedere alla fotocamera. Verifica i permessi.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoUrl = canvas.toDataURL('image/jpeg');
        setCapturedMedia({
          type: 'photo',
          url: photoUrl,
          caption: ''
        });
      }
    }
  };

  const handleSendMedia = () => {
    if (!capturedMedia || !user) return;

    const mediaFile = {
      id: Date.now().toString(),
      employeeId: user.id,
      type: capturedMedia.type,
      url: capturedMedia.url,
      caption: capturedMedia.caption,
      timestamp: new Date(),
      status: 'pending' as const
    };

    addMediaFile(mediaFile);
    setCapturedMedia(null);
    alert('Media inviato con successo!');
  };

  const handleDeleteMedia = () => {
    setCapturedMedia(null);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Foto & Video</h1>
          <p className="mt-2 text-sm text-gray-700">
            Scatta foto e registra video per documentare il lavoro svolto
          </p>
        </div>
      </div>

      {/* Camera Interface */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {!stream ? (
            <div className="text-center py-12">
              <Camera className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Fotocamera</h3>
              <p className="mt-2 text-sm text-gray-600">
                Attiva la fotocamera per iniziare a scattare foto o registrare video
              </p>
              <button
                onClick={startCamera}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="mr-2 h-4 w-4" />
                Attiva Fotocamera
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={capturePhoto}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Scatta Foto
                </button>

                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                    isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Ferma Video
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-5 w-5" />
                      Registra Video
                    </>
                  )}
                </button>

                <button
                  onClick={stopCamera}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Chiudi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Captured Media Preview */}
      {capturedMedia && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Anteprima Media</h3>
            
            <div className="space-y-4">
              <div className="relative">
                {capturedMedia.type === 'photo' ? (
                  <img
                    src={capturedMedia.url}
                    alt="Captured"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={capturedMedia.url}
                    controls
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
                  Descrizione (opzionale)
                </label>
                <textarea
                  id="caption"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Aggiungi una descrizione del lavoro svolto..."
                  value={capturedMedia.caption}
                  onChange={(e) => setCapturedMedia({
                    ...capturedMedia,
                    caption: e.target.value
                  })}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSendMedia}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Invia
                </button>

                <button
                  onClick={handleDeleteMedia}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Istruzioni:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Attiva la fotocamera per iniziare</li>
          <li>• Scatta foto per documentare il lavoro in corso o completato</li>
          <li>• Registra video per spiegazioni dettagliate</li>
          <li>• Aggiungi sempre una descrizione per contesto</li>
          <li>• I media vengono inviati automaticamente all'amministratore</li>
        </ul>
      </div>
    </div>
  );
}
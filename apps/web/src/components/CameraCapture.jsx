
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

const CameraCapture = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error("Camera error:", err);
      setError('Akses kamera ditolak atau kamera tidak tersedia.');
      toast.error('Gagal mengakses kamera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setHasPhoto(false);
      setPhotoUrl('');
    }
    return () => stopCamera();
  }, [open]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const url = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoUrl(url);
    setHasPhoto(true);

    stopCamera();
  };

  const retakePhoto = () => {
    setHasPhoto(false);
    setPhotoUrl('');
    startCamera();
  };

  const confirmPhoto = () => {
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none">
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <DialogTitle className="text-white flex justify-between items-center">
            <span>Ambil Foto</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-[3/4] sm:aspect-video flex items-center justify-center bg-black">
          {error ? (
            <div className="text-center p-6">
              <Camera className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/80 mb-4">{error}</p>
              <Button onClick={startCamera} variant="secondary">Coba Lagi</Button>
            </div>
          ) : !hasPhoto ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={photoUrl} alt="Captured" className="w-full h-full object-contain" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="p-6 bg-black flex justify-center gap-4">
          {!hasPhoto ? (
            <Button onClick={takePhoto} size="lg" className="rounded-full w-16 h-16 p-0 bg-white hover:bg-gray-200 border-4 border-gray-400">
              <span className="sr-only">Ambil Foto</span>
            </Button>
          ) : (
            <>
              <Button onClick={retakePhoto} variant="outline" size="lg" className="rounded-full px-8 bg-transparent text-white border-white hover:bg-white/20">
                <RefreshCw className="w-4 h-4 mr-2" /> Ulangi
              </Button>
              <Button onClick={confirmPhoto} size="lg" className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                Gunakan Foto
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCapture;

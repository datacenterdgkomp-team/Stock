
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ isOpen, onClose, onBarcodeDetected, onError }) => {
  const [error, setError] = useState(null);
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  };

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      if (!isOpen) return;
      
      setError(null);
      setDetectedBarcode(null);
      isScanningRef.current = true;

      try {
        html5QrCode = new Html5Qrcode("barcode-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778, // 16:9
          },
          (decodedText) => {
            if (isScanningRef.current) {
              isScanningRef.current = false; // Prevent multiple triggers
              playBeep();
              setDetectedBarcode(decodedText);
              
              // Auto close after a short delay to show success state
              setTimeout(() => {
                onBarcodeDetected(decodedText);
                onClose();
              }, 1000);
            }
          },
          (errorMessage) => {
            // Ignore continuous frame scanning errors
          }
        );
      } catch (err) {
        console.error("Scanner initialization error:", err);
        isScanningRef.current = false;
        setError("Kamera tidak dapat diakses. Pastikan Anda telah memberikan izin kamera.");
        if (onError) onError(err);
      }
    };

    const stopScanner = async () => {
      isScanningRef.current = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
    };

    if (isOpen) {
      // Small delay to ensure DOM element is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, onBarcodeDetected, onClose, onError]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader className="p-4 pb-0 relative z-10">
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Barcode dengan Kamera
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden mt-2">
          {error ? (
            <div className="flex flex-col items-center justify-center p-6 text-center z-10">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-sm text-zinc-300">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                onClick={onClose}
              >
                Tutup
              </Button>
            </div>
          ) : (
            <>
              <div id="barcode-reader" className="w-full h-full object-cover" />
              
              {/* Overlay UI */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {detectedBarcode ? (
                  <div className="bg-green-500/90 text-white px-4 py-2 rounded-full font-mono font-bold text-lg flex items-center gap-2 shadow-lg animate-in zoom-in duration-200">
                    <CheckCircle2 className="w-5 h-5" />
                    {detectedBarcode}
                  </div>
                ) : (
                  <>
                    {/* Crosshair */}
                    <div className="w-[250px] h-[150px] border-2 border-white/50 rounded-xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl-lg -mt-1 -ml-1" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr-lg -mt-1 -mr-1" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl-lg -mb-1 -ml-1" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br-lg -mb-1 -mr-1" />
                      
                      {/* Scanning line animation */}
                      <div className="absolute left-0 right-0 h-0.5 bg-primary/80 shadow-[0_0_8px_2px_rgba(var(--primary),0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                    <p className="mt-6 text-sm font-medium text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      Arahkan kamera ke barcode
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 flex justify-end bg-zinc-950">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;

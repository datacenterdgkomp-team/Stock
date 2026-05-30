
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Copy, Check, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const QRISImagePreviewModal = ({ open, onClose, imageUrl, title = 'Preview QRIS' }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleCopyLink = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setIsCopied(true);
    toast.success('Link gambar disalin ke clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `QRIS_${title.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => toast.error('Gagal mengunduh gambar'));
  };

  const handlePrint = () => {
    if (!imageUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Gagal membuka jendela cetak. Periksa pemblokir popup Anda.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QRIS - ${title}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 90vh; object-fit: contain; }
            .print-btn { display: none; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2 style="font-family: sans-serif; margin-bottom: 20px;">${title}</h2>
            <img src="${imageUrl}" onload="window.print(); window.close();" />
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  // Reset state when closing
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setScale(1);
    }
    onClose(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <DialogHeader className="p-4 border-b shrink-0 bg-background/50">
          <DialogTitle className="text-lg flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-1 sm:gap-2 mr-6">
              <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={scale <= 0.5} title="Perkecil">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
              <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={scale >= 3} title="Perbesar">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 bg-muted/20">
          {hasError ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <AlertCircle className="w-12 h-12 mb-4 text-destructive/50" />
              <p>Gagal memuat gambar QRIS.</p>
            </div>
          ) : (
            <div 
              className="relative transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${scale})` }}
            >
              {isLoading && (
                <Skeleton className="w-[300px] h-[300px] absolute inset-0 rounded-xl" />
              )}
              <img
                src={imageUrl}
                alt={`QRIS ${title}`}
                className={`max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg bg-white p-4 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t shrink-0 flex flex-wrap gap-2 justify-end bg-background/50">
          <Button variant="secondary" onClick={handleCopyLink} disabled={hasError || isLoading}>
            {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {isCopied ? 'Tersalin!' : 'Salin Link'}
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={hasError || isLoading}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
          <Button onClick={handleDownload} disabled={hasError || isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Unduh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRISImagePreviewModal;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, Copy, Check, Maximize2, AlertCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import QRISImagePreviewModal from './QRISImagePreviewModal.jsx';

const QRISImageDisplay = ({ imageUrl, title = 'QRIS Payment', className = '' }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopyLink = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setIsCopied(true);
    toast.success('Link gambar disalin');
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
      toast.error('Gagal membuka popup cetak.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head><title>Print QRIS</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
          <img src="${imageUrl}" style="max-width:100%;max-height:90vh;" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!imageUrl) {
    return (
      <div className={`qris-display-wrapper bg-muted/30 border-dashed ${className}`}>
        <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
          <QrCode className="w-12 h-12 mb-2 opacity-20" />
          <p className="text-sm font-medium">QRIS tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div 
          className="qris-display-wrapper group cursor-pointer relative"
          onClick={() => !hasError && setShowPreview(true)}
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-destructive/70 bg-destructive/5 p-4 text-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-xs">Gagal memuat gambar</p>
            </div>
          ) : (
            <>
              <img
                src={imageUrl}
                alt={title}
                className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
                <Maximize2 className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink} disabled={hasError || isLoading} className="h-8 text-xs">
            {isCopied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            Salin
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={hasError || isLoading} className="h-8 text-xs">
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Cetak
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={hasError || isLoading} className="h-8 text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Unduh
          </Button>
        </div>
      </div>

      <QRISImagePreviewModal 
        open={showPreview} 
        onClose={() => setShowPreview(false)} 
        imageUrl={imageUrl} 
        title={title} 
      />
    </>
  );
};

export default QRISImageDisplay;

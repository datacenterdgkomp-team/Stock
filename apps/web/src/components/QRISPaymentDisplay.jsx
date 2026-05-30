
import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import QRISImagePreviewModal from './QRISImagePreviewModal.jsx';
import { Maximize2, QrCode } from 'lucide-react';

const QRISPaymentDisplay = ({ method, className = '' }) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!method || method.tipe_metode !== 'qris') {
    return null;
  }

  const hasImage = !!method.qris_image;
  const imageUrl = hasImage ? pb.files.getUrl(method, method.qris_image) : null;

  return (
    <div className={`p-4 md:p-6 bg-card border rounded-xl shadow-sm space-y-4 animate-fade-in ${className}`}>
      <div className="text-center space-y-1">
        <h4 className="font-semibold text-lg text-foreground">{method.nama}</h4>
        {method.deskripsi && (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{method.deskripsi}</p>
        )}
      </div>

      <div className="flex justify-center py-2">
        {imageUrl ? (
          <div 
            className="relative group cursor-pointer rounded-xl border border-border shadow-sm overflow-hidden bg-white p-2 w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] transition-all duration-300 hover:shadow-md"
            onClick={() => setShowPreview(true)}
          >
            <img 
              src={imageUrl} 
              alt={`QRIS ${method.nama}`} 
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
              <Maximize2 className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] bg-muted/30 border-dashed border-2 rounded-xl flex flex-col items-center justify-center text-muted-foreground">
            <QrCode className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm font-medium">QRIS tidak tersedia</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Silakan scan kode QR di atas menggunakan aplikasi mobile banking atau e-wallet Anda.
        </p>
      </div>

      {imageUrl && (
        <QRISImagePreviewModal 
          open={showPreview} 
          onClose={() => setShowPreview(false)} 
          imageUrl={imageUrl} 
          title={method.nama} 
        />
      )}
    </div>
  );
};

export default QRISPaymentDisplay;


import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadCloud, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LogoUploadField = ({ currentLogoUrl, onFileSelect, onFileRemove, isUploading }) => {
  const [previewUrl, setPreviewUrl] = useState(currentLogoUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setFileInfo({
          size: (file.size / 1024).toFixed(2) + ' KB',
          dimensions: `${img.width} x ${img.height} px`
        });
        setPreviewUrl(e.target.result);
        onFileSelect(file);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
  };

  return (
    <Card className="p-4 md:p-6 flex flex-col items-center justify-center space-y-4 border-dashed border-2 bg-muted/10">
      <div className="w-full max-w-[200px] aspect-square rounded-xl border shadow-sm overflow-hidden bg-card flex items-center justify-center relative group">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="destructive" size="sm" onClick={handleRemove} disabled={isUploading}>
                <X className="w-4 h-4 mr-2" /> Hapus
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-muted-foreground flex flex-col items-center">
            <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-sm font-medium">Belum ada logo</span>
          </div>
        )}
      </div>

      {fileInfo && (
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Ukuran: {fileInfo.size}</p>
          <p>Dimensi: {fileInfo.dimensions}</p>
        </div>
      )}

      <div 
        className={`w-full p-6 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
          <div className="text-sm">
            <span className="font-semibold text-primary">Klik untuk upload</span> atau drag and drop
          </div>
          <p className="text-xs">JPG, PNG, WebP (Max 5MB)</p>
        </div>
      </div>
    </Card>
  );
};

export default LogoUploadField;


import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const MAX_FILE_SIZE_MB = 5;

const QRISImageUploadField = ({ existingImageUrl, onFileSelect, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(existingImageUrl || null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(existingImageUrl || null);
  }, [existingImageUrl]);

  const validateImage = async (file) => {
    return new Promise((resolve) => {
      setError('');
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        resolve({ valid: false, error: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.' });
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        resolve({ valid: false, error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE_MB}MB.` });
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { width, height } = img;
        
        if (width < 100 || height < 100) {
          resolve({ valid: false, error: 'Resolusi terlalu kecil. Minimal 100x100px.' });
          return;
        }
        if (width > 2000 || height > 2000) {
          resolve({ valid: false, error: 'Resolusi terlalu besar. Maksimal 2000x2000px.' });
          return;
        }
        
        // Check aspect ratio (should be somewhat square for QR)
        const ratio = Math.max(width, height) / Math.min(width, height);
        if (ratio > 1.5) {
          resolve({ valid: false, error: 'Dimensi gambar harus mendekati kotak (1:1).' });
          return;
        }
        
        resolve({ valid: true });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'File gambar rusak atau tidak valid.' });
      };
      
      img.src = objectUrl;
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    
    setIsLoading(true);
    const validation = await validateImage(file);
    
    if (!validation.valid) {
      setError(validation.error);
      toast.error(validation.error);
      setIsLoading(false);
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onFileSelect(file);
      toast.success('Gambar berhasil dipilih');
    } catch (err) {
      setError('Terjadi kesalahan saat memproses gambar');
    } finally {
      setIsLoading(false);
    }
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.dataTransfer?.files[0] || e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove();
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="qris-preview-container bg-white">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <span className="text-sm font-medium">Memproses...</span>
            </div>
          )}
          <img 
            src={preview} 
            alt="Preview QRIS" 
            className="w-full h-full object-contain p-2"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md opacity-80 hover:opacity-100"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-2 left-2 bg-success text-success-foreground text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Valid
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "upload-area aspect-square max-w-[300px] mx-auto",
            isDragging && "is-dragging",
            error && "has-error"
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <span className="text-sm font-medium">Memproses...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Klik atau seret gambar QRIS</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP (Maks 5MB)</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-destructive justify-center mt-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default QRISImageUploadField;

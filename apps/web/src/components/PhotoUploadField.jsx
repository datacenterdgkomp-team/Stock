
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, X, Loader2, Image as ImageIcon, Camera } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { validateImage, compressImage } from '@/lib/photoUtils';
import CameraCapture from './CameraCapture.jsx';

const PhotoUploadField = ({ 
  existingPhotos = [], 
  record = null,
  onPhotosChange, 
  maxPhotos = 5,
  isUploading = false 
}) => {
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentExisting, setCurrentExisting] = useState(existingPhotos);
  const [deletedExisting, setDeletedExisting] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  
  const fileInputRef = useRef(null);

  const safeOnPhotosChange = (data) => {
    if (typeof onPhotosChange === 'function') {
      onPhotosChange(data);
    }
  };

  useEffect(() => {
    setCurrentExisting(existingPhotos);
    setNewFiles([]);
    setPreviews([]);
    setDeletedExisting([]);
  }, [existingPhotos]);

  const totalPhotos = currentExisting.length + newFiles.length;

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    if (totalPhotos + fileArray.length > maxPhotos) {
      toast.error(`Maksimal ${maxPhotos} foto diperbolehkan.`);
      return;
    }

    setIsCompressing(true);
    
    try {
      const processedFiles = [];
      const newPreviews = [];

      for (const file of fileArray) {
        const validation = validateImage(file);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }

        const compressedFile = await compressImage(file);
        processedFiles.push(compressedFile);
        
        const objectUrl = URL.createObjectURL(compressedFile);
        newPreviews.push(objectUrl);
      }

      if (processedFiles.length > 0) {
        const updatedNewFiles = [...newFiles, ...processedFiles];
        const updatedPreviews = [...previews, ...newPreviews];
        
        setNewFiles(updatedNewFiles);
        setPreviews(updatedPreviews);
        
        safeOnPhotosChange({
          newFiles: updatedNewFiles,
          deletedExisting
        });
      }
    } catch (error) {
      console.error('Error processing photos:', error);
      toast.error('Gagal memproses gambar. Coba lagi.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeNewFile = (indexToRemove) => {
    URL.revokeObjectURL(previews[indexToRemove]);
    
    const updatedFiles = newFiles.filter((_, idx) => idx !== indexToRemove);
    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    
    setNewFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    safeOnPhotosChange({
      newFiles: updatedFiles,
      deletedExisting
    });
  };

  const removeExistingPhoto = (photoName) => {
    const updatedExisting = currentExisting.filter(p => p !== photoName);
    const updatedDeleted = [...deletedExisting, photoName];
    
    setCurrentExisting(updatedExisting);
    setDeletedExisting(updatedDeleted);
    
    safeOnPhotosChange({
      newFiles,
      deletedExisting: updatedDeleted
    });
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
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleCameraCapture = (file) => {
    if (file) {
      processFiles([file]);
    }
  };

  return (
    <Card className="p-4 bg-card shadow-sm border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Foto Barang
        </h4>
        <Badge variant={totalPhotos >= maxPhotos ? "destructive" : "secondary"}>
          {totalPhotos} / {maxPhotos}
        </Badge>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
        {currentExisting.map((photoName) => (
          <div key={photoName} className="relative aspect-square rounded-xl overflow-hidden border bg-muted/50 group">
            <img 
              src={pb.files.getUrl(record, photoName, { thumb: '100x100f' })} 
              alt="Existing" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                variant="destructive" 
                size="icon" 
                className="w-8 h-8 rounded-full"
                onClick={() => removeExistingPhoto(photoName)}
                disabled={isUploading}
                type="button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {previews.map((url, idx) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-primary/50 bg-primary/5 group">
            <img src={url} alt={`New Preview ${idx}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                variant="destructive" 
                size="icon" 
                className="w-8 h-8 rounded-full shadow-lg"
                onClick={() => removeNewFile(idx)}
                disabled={isUploading || isCompressing}
                type="button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPhotos < maxPhotos && (
        <div className="flex flex-col gap-3">
          <div 
            className={`upload-area ${isDragging ? 'is-dragging' : ''} ${(isUploading || isCompressing) ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple={maxPhotos > 1}
              onChange={(e) => processFiles(e.target.files)}
              disabled={isUploading || isCompressing}
            />
            
            {(isUploading || isCompressing) ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            ) : (
              <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
            )}
            
            <div className="text-sm">
              <span className="font-semibold text-primary">Klik untuk upload</span> atau drag and drop
            </div>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP (Max 5MB)</p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full gap-2" 
            onClick={() => setCameraOpen(true)}
            disabled={isUploading || isCompressing}
          >
            <Camera className="w-4 h-4" /> Ambil dari Kamera
          </Button>
        </div>
      )}

      <CameraCapture 
        open={cameraOpen} 
        onClose={() => setCameraOpen(false)} 
        onCapture={handleCameraCapture} 
      />
    </Card>
  );
};

export default PhotoUploadField;

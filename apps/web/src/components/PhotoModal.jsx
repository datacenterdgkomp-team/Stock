
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { FileImage as ImageIcon } from 'lucide-react';

const PhotoModal = ({ open, onClose, photoUrl, title, subtitle }) => {
  if (!photoUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 overflow-hidden bg-black/95 border-none flex flex-col">
        <DialogHeader className="p-4 absolute top-0 w-full z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-center w-full">
            <div>
              <DialogTitle className="text-white text-lg tracking-tight font-medium flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-white/70" />
                {title || 'Foto Preview'}
              </DialogTitle>
              {subtitle && (
                <p className="text-sm text-white/70 mt-1">{subtitle}</p>
              )}
            </div>
            {/* Close button provided by Dialog primitive, but we can style it using standard shadcn if needed. 
                shadcn DialogContent already has an absolute close button. */}
          </div>
        </DialogHeader>
        
        <div className="flex-1 w-full h-full flex items-center justify-center p-4 pt-16">
          <img 
            src={photoUrl} 
            alt={title || 'Full size foto'} 
            className="max-w-full max-h-[80vh] object-contain rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoModal;

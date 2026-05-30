
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const ServicePhotoGallery = ({ photos = [], record }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-32 bg-muted/30 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
        <span className="text-sm">Tidak ada foto</span>
      </div>
    );
  }

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {photos.map((photoName, index) => (
          <div
            key={photoName}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer border shadow-sm hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all relative group bg-muted/20"
            onClick={() => openLightbox(index)}
          >
            <img
              src={pb.files.getUrl(record, photoName, { thumb: '100x100f' })}
              alt={`Foto Service ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none shadow-2xl overflow-hidden [&>button]:text-white">
          <DialogTitle className="sr-only">Foto Service</DialogTitle>
          <DialogDescription className="sr-only">Tampilan penuh foto service</DialogDescription>
          
          <div className="relative w-full h-[80vh] flex items-center justify-center group">
            {photos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            <img
              src={pb.files.getUrl(record, photos[currentIndex])}
              alt={`Foto Service ${currentIndex + 1} ukuran penuh`}
              className="max-w-full max-h-full object-contain select-none"
            />

            {photos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServicePhotoGallery;

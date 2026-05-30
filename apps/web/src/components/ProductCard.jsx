
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, PackageX } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const ProductCard = ({ product, onAdd }) => {
  const isOutOfStock = product.stok <= 0;
  
  // Generate image URL or use a placeholder if none exists
  const imageUrl = product.photo 
    ? pb.files.getUrl(product, product.photo) 
    : null;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      onAdd(product);
    }
  };

  return (
    <div 
      className={`product-card group ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
      onClick={() => !isOutOfStock && onAdd(product)}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted/30 p-3 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.nama} 
            className="w-full h-full object-cover rounded-lg shadow-sm transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1pbWFnZSI+PHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB4PSIzIiB5PSIzIiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI5IiBjeT0iOSIgcj0iMiIvPjxwYXRoIGQ9Im0yMSAxNS0zLjA4Ni0zLjA4NmExLjIgMS4yIDAgMCAwLTEuNzE0IDBsLTQuMjI4IDQuMjI4Ii8+PHBhdGggZD0ibTE2IDIxIDIuMDk0LTIuMDk0YTEuMiAxLjIgMCAwIDAtMS43MTQtMS43MTRMMTUgMTkiLz48L3N2Zz4=';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50 rounded-lg">
            <PackageX className="w-10 h-10 mb-2 opacity-20" />
            <span className="text-xs font-medium opacity-50">No Image</span>
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              Habis
            </span>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 md:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm md:text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.nama}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-1.5">
            {product.kode_barang}
          </p>
        </div>
        
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-border/50">
          <div className="flex flex-col">
            <p className="font-bold text-primary text-sm md:text-base">
              Rp {product.harga_jual.toLocaleString('id-ID')}
            </p>
            <p className={`text-[11px] md:text-xs mt-0.5 font-medium ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
              {isOutOfStock ? 'Stok Habis' : `Stok: ${product.stok}`}
            </p>
          </div>
          
          <Button 
            size="icon" 
            variant={isOutOfStock ? "outline" : "default"} 
            disabled={isOutOfStock} 
            className={`h-8 w-8 md:h-9 md:w-9 rounded-full shrink-0 shadow-sm transition-transform active:scale-95 ${!isOutOfStock ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}`}
            onClick={handleAddClick}
            aria-label="Tambah ke keranjang"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default ProductCard;

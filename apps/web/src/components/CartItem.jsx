
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const imageUrl = item.photo 
    ? pb.files.getUrl(item, item.photo, { thumb: '100x100' }) 
    : null;

  return (
    <div className="cart-item-row group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-md overflow-hidden bg-muted/50 border border-border flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={item.nama} 
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
          )}
        </div>
        
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-medium text-sm text-foreground truncate" title={item.nama}>
            {item.nama}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] md:text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              {item.kode_barang}
            </span>
            <span className="text-xs font-medium text-primary">
              Rp {item.harga_jual.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="font-bold text-sm text-foreground">
          Rp {(item.harga_jual * item.qty).toLocaleString('id-ID')}
        </p>
        
        <div className="flex items-center space-x-1 bg-background border rounded-md p-0.5 shadow-sm">
          <Button
            size="icon"
            variant="ghost"
            disabled={item.qty <= 1}
            onClick={() => onUpdateQty(item.id, item.qty - 1)}
            className="h-6 w-6 md:h-7 md:w-7 rounded-sm hover:bg-muted hover:text-foreground"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <span className="w-6 md:w-8 text-center text-xs md:text-sm font-semibold tabular-nums">
            {item.qty}
          </span>
          
          <Button
            size="icon"
            variant="ghost"
            disabled={item.qty >= item.stok}
            onClick={() => onUpdateQty(item.id, item.qty + 1)}
            className="h-6 w-6 md:h-7 md:w-7 rounded-sm hover:bg-muted hover:text-foreground"
          >
            <Plus className="w-3 h-3" />
          </Button>
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRemove(item.id)}
            className="h-6 w-6 md:h-7 md:w-7 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Hapus item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

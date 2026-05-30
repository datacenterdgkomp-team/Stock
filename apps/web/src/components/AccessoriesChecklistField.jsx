
import React, { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Search, Loader2 } from 'lucide-react';
import { useKelengkapanBarang } from '@/hooks/useKelengkapanBarang';

const AccessoriesChecklistField = ({ selectedIds = [], onChange }) => {
  const { fetchKelengkapanBarang, loading } = useKelengkapanBarang();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadItems = async () => {
      const data = await fetchKelengkapanBarang();
      if (mounted) {
        setItems(data);
      }
    };
    loadItems();
    return () => { mounted = false; };
  }, [fetchKelengkapanBarang]);

  const toggleItem = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.nama_kelengkapan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          Kelengkapan Barang
        </Label>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary whitespace-nowrap">
            {selectedIds.length} Terpilih
          </Badge>
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari kelengkapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Memuat daftar kelengkapan...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground italic">
          Belum ada data kelengkapan barang. Tambahkan di Pengaturan Umum.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-2 p-1 rounded hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`acc-${item.id}`}
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`acc-${item.id}`}
                    className="text-sm font-medium cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.nama_kelengkapan}
                  </Label>
                  {item.deskripsi && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1" title={item.deskripsi}>
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
              Tidak ada kelengkapan yang cocok dengan pencarian.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessoriesChecklistField;

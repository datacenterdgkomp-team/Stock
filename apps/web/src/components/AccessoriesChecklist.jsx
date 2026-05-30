
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';

const COMMON_ACCESSORIES = [
  'Kabel Power',
  'Baterai',
  'Charger / Adaptor',
  'Manual / Panduan',
  'Kartu Garansi',
  'Dus / Kemasan'
];

const AccessoriesChecklist = ({ selected = [], onChange }) => {
  const [customItem, setCustomItem] = useState('');

  const toggleItem = (item) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = customItem.trim();
    if (trimmed && !selected.includes(trimmed) && !COMMON_ACCESSORIES.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomItem('');
    }
  };

  const customSelectedItems = selected.filter(item => !COMMON_ACCESSORIES.includes(item));

  return (
    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          Kelengkapan Barang
        </Label>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {selected.length} Terpilih
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {COMMON_ACCESSORIES.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`acc-${item}`}
              checked={selected.includes(item)}
              onCheckedChange={() => toggleItem(item)}
            />
            <Label
              htmlFor={`acc-${item}`}
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {item}
            </Label>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t mt-4">
        <Label className="text-xs text-muted-foreground mb-2 block">Aksesoris Lainnya</Label>
        <div className="flex items-center gap-2 mb-3">
          <Input
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustom(e);
            }}
            placeholder="Ketik lalu Enter..."
            className="h-9 text-sm"
          />
          <Button type="button" size="sm" variant="secondary" onClick={handleAddCustom}>
            Tambah
          </Button>
        </div>
        
        {customSelectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customSelectedItems.map((item) => (
              <Badge key={item} variant="outline" className="flex items-center gap-1 bg-background px-2 py-1">
                {item}
                <button
                  type="button"
                  onClick={() => toggleItem(item)}
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoriesChecklist;

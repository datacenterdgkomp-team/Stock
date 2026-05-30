
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterPanel = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // 1st of current month
    endDate: new Date().toISOString().split('T')[0],
    metode: 'all',
    kategori: 'all'
  });

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      metode: 'all',
      kategori: 'all'
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <Label htmlFor="startDate" className="text-xs text-muted-foreground mb-1.5 block">Tanggal Mulai</Label>
          <Input 
            id="startDate" 
            type="date" 
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-xs text-muted-foreground mb-1.5 block">Tanggal Akhir</Label>
          <Input 
            id="endDate" 
            type="date" 
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Metode Pemasukan</Label>
          <Select value={filters.metode} onValueChange={(val) => setFilters({...filters, metode: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Metode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="Tunai">Tunai</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Kategori Pengeluaran</Label>
          <Select value={filters.kategori} onValueChange={(val) => setFilters({...filters, kategori: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="Gaji">Gaji</SelectItem>
              <SelectItem value="Listrik">Listrik</SelectItem>
              <SelectItem value="Internet">Internet</SelectItem>
              <SelectItem value="Sewa">Sewa</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleReset} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

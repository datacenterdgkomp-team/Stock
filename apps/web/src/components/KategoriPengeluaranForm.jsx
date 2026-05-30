
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { getIcon } from '@/lib/iconMap.js';

const KategoriPengeluaranForm = ({ open, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_kategori: '',
    deskripsi: '',
    warna: '#3b82f6', // Default blue
    icon: 'Wallet'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        nama_kategori: item.nama_kategori || '',
        deskripsi: item.deskripsi || '',
        warna: item.warna || '#3b82f6',
        icon: item.icon || 'Wallet'
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [item, open]);

  const resetForm = () => {
    setFormData({
      nama_kategori: '',
      deskripsi: '',
      warna: '#3b82f6',
      icon: 'Wallet'
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nama_kategori.trim()) {
      newErrors.nama_kategori = 'Nama kategori wajib diisi';
    } else if (formData.nama_kategori.length > 100) {
      newErrors.nama_kategori = 'Maksimal 100 karakter';
    }

    if (formData.deskripsi && formData.deskripsi.length > 500) {
      newErrors.deskripsi = 'Maksimal 500 karakter';
    }

    if (formData.warna && !/^#[0-9A-F]{6}$/i.test(formData.warna)) {
      newErrors.warna = 'Format warna tidak valid (Gunakan Hex, misal: #FF0000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Mohon periksa kembali form isian Anda');
      return;
    }

    setLoading(true);
    try {
      if (item) {
        await pb.collection('kategori_pengeluaran').update(item.id, formData, { $autoCancel: false });
        toast.success('Kategori berhasil diperbarui');
      } else {
        await pb.collection('kategori_pengeluaran').create(formData, { $autoCancel: false });
        toast.success('Kategori berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving kategori:', error);
      if (error.status === 400 && error.data?.data?.nama_kategori?.code === 'validation_not_unique') {
        setErrors(prev => ({ ...prev, nama_kategori: 'Nama kategori sudah terdaftar' }));
        toast.error('Nama kategori sudah terdaftar');
      } else {
        toast.error(item ? 'Gagal memperbarui kategori' : 'Gagal menambahkan kategori');
      }
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = getIcon(formData.icon) || getIcon('HelpCircle');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Kategori Pengeluaran' : 'Tambah Kategori Pengeluaran'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nama_kategori">Nama Kategori <span className="text-destructive">*</span></Label>
            <Input
              id="nama_kategori"
              value={formData.nama_kategori}
              onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
              className={errors.nama_kategori ? 'border-destructive' : ''}
              maxLength={100}
              placeholder="Misal: Listrik, Gaji, dll"
            />
            {errors.nama_kategori && <p className="text-xs text-destructive">{errors.nama_kategori}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              maxLength={500}
              rows={3}
              placeholder="Penjelasan singkat tentang kategori ini"
            />
            {errors.deskripsi && <p className="text-xs text-destructive">{errors.deskripsi}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warna">Warna Label</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="warna"
                  type="color"
                  value={formData.warna}
                  onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.warna}
                  onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                  className="flex-1 uppercase"
                  placeholder="#000000"
                />
              </div>
              {errors.warna && <p className="text-xs text-destructive">{errors.warna}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Nama Icon</Label>
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 rounded-lg border shadow-sm flex items-center justify-center bg-muted shrink-0">
                  {IconComponent && <IconComponent className="w-5 h-5" style={{ color: formData.warna }} />}
                </div>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Misal: Zap, Users"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Sesuai referensi icon sistem</p>
            </div>
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            {!item && (
              <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto mr-auto">
                Reset
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Menyimpan...' : (item ? 'Simpan Perubahan' : 'Tambah Kategori')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KategoriPengeluaranForm;

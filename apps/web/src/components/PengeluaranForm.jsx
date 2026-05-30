
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const PengeluaranForm = ({ open, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    nomor_pengeluaran: '',
    tanggal: new Date().toISOString().split('T')[0],
    kategori_pengeluaran: '',
    deskripsi: '',
    jumlah: '',
    keterangan: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const records = await pb.collection('kategori_pengeluaran').getFullList({
        sort: 'nama_kategori',
        $autoCancel: false
      });
      setCategories(records);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal memuat daftar kategori');
    }
  };

  useEffect(() => {
    if (item) {
      setFormData({
        nomor_pengeluaran: item.nomor_pengeluaran || '',
        tanggal: item.tanggal ? item.tanggal.split(' ')[0] : new Date().toISOString().split('T')[0],
        kategori_pengeluaran: item.kategori_pengeluaran || '',
        deskripsi: item.deskripsi || '',
        jumlah: item.jumlah?.toString() || '',
        keterangan: item.keterangan || ''
      });
    } else {
      setFormData({
        nomor_pengeluaran: `EXP-${Date.now().toString().slice(-6)}`,
        tanggal: new Date().toISOString().split('T')[0],
        kategori_pengeluaran: '',
        deskripsi: '',
        jumlah: '',
        keterangan: ''
      });
    }
    setErrors({});
  }, [item, open]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.kategori_pengeluaran) newErrors.kategori_pengeluaran = 'Kategori wajib dipilih';
    if (!formData.jumlah || isNaN(formData.jumlah) || Number(formData.jumlah) <= 0) {
      newErrors.jumlah = 'Jumlah harus lebih dari 0';
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
      const dataToSubmit = {
        ...formData,
        jumlah: Number(formData.jumlah),
        tanggal: new Date(formData.tanggal).toISOString()
      };

      if (item) {
        await pb.collection('pengeluaran_harian').update(item.id, dataToSubmit, { $autoCancel: false });
        toast.success('Pengeluaran berhasil diperbarui');
      } else {
        await pb.collection('pengeluaran_harian').create(dataToSubmit, { $autoCancel: false });
        toast.success('Pengeluaran berhasil ditambahkan');
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving pengeluaran:', error);
      toast.error(item ? 'Gagal memperbarui pengeluaran' : 'Gagal menambahkan pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = (cat) => {
    const IconComponent = getIcon(cat.icon) || getIcon('HelpCircle');
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-5 h-5 rounded flex items-center justify-center shrink-0 border" 
          style={{ backgroundColor: cat.warna || '#e2e8f0' }}
        >
          {IconComponent && <IconComponent className="w-3 h-3 text-white mix-blend-difference" />}
        </div>
        <span>{cat.nama_kategori}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomor_pengeluaran">Nomor Referensi</Label>
              <Input
                id="nomor_pengeluaran"
                value={formData.nomor_pengeluaran}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal <span className="text-destructive">*</span></Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className={errors.tanggal ? 'border-destructive' : ''}
              />
              {errors.tanggal && <p className="text-xs text-destructive">{errors.tanggal}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori_pengeluaran">Kategori <span className="text-destructive">*</span></Label>
            <Select 
              value={formData.kategori_pengeluaran} 
              onValueChange={(value) => setFormData({ ...formData, kategori_pengeluaran: value })}
            >
              <SelectTrigger className={errors.kategori_pengeluaran ? 'border-destructive' : ''}>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.nama_kategori}>
                    {renderCategoryItem(cat)}
                  </SelectItem>
                ))}
                {categories.length === 0 && (
                  <SelectItem value="disabled" disabled>Tidak ada kategori tersedia</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.kategori_pengeluaran && <p className="text-xs text-destructive">{errors.kategori_pengeluaran}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah (Rp) <span className="text-destructive">*</span></Label>
            <Input
              id="jumlah"
              type="number"
              min="0"
              value={formData.jumlah}
              onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
              className={errors.jumlah ? 'border-destructive' : ''}
              placeholder="0"
            />
            {errors.jumlah && <p className="text-xs text-destructive">{errors.jumlah}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi Singkat</Label>
            <Input
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Misal: Beli token listrik"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan Tambahan</Label>
            <Textarea
              id="keterangan"
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              rows={3}
              placeholder="Catatan opsional..."
            />
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Menyimpan...' : (item ? 'Simpan Perubahan' : 'Tambah Pengeluaran')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PengeluaranForm;

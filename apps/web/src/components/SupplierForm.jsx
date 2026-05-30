
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
import { toast } from 'sonner';

const SupplierForm = ({ open, onClose, item, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_supplier: '',
    alamat: '',
    kota: '',
    provinsi: '',
    telepon: '',
    email: '',
    website: '',
    kontak_person: '',
    catatan: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        nama_supplier: item.nama_supplier || '',
        alamat: item.alamat || '',
        kota: item.kota || '',
        provinsi: item.provinsi || '',
        telepon: item.telepon || '',
        email: item.email || '',
        website: item.website || '',
        kontak_person: item.kontak_person || '',
        catatan: item.catatan || ''
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [item, open]);

  const resetForm = () => {
    setFormData({
      nama_supplier: '',
      alamat: '',
      kota: '',
      provinsi: '',
      telepon: '',
      email: '',
      website: '',
      kontak_person: '',
      catatan: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nama_supplier.trim()) {
      newErrors.nama_supplier = 'Nama supplier wajib diisi';
    } else if (formData.nama_supplier.length > 100) {
      newErrors.nama_supplier = 'Maksimal 100 karakter';
    }

    if (formData.telepon) {
      const phoneRegex = /^(08|\+62)\d{7,13}$/;
      if (!phoneRegex.test(formData.telepon.replace(/[- ]/g, ''))) {
        newErrors.telepon = 'Format tidak valid (Gunakan 08... atau +62...)';
      }
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Format email tidak valid';
      }
    }

    if (formData.website) {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(formData.website)) {
        newErrors.website = 'Format URL tidak valid';
      }
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
      await onSubmit(formData);
      onClose();
    } catch (error) {
      if (error.status === 400 && error.data?.data?.nama_supplier?.code === 'validation_not_unique') {
        setErrors(prev => ({ ...prev, nama_supplier: 'Nama supplier sudah terdaftar' }));
        toast.error('Nama supplier sudah terdaftar');
      } else {
        toast.error(item ? 'Gagal memperbarui supplier' : 'Gagal menambahkan supplier');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Supplier' : 'Tambah Supplier Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nama_supplier">Nama Supplier <span className="text-destructive">*</span></Label>
              <Input
                id="nama_supplier"
                value={formData.nama_supplier}
                onChange={(e) => setFormData({ ...formData, nama_supplier: e.target.value })}
                className={errors.nama_supplier ? 'border-destructive' : ''}
                maxLength={100}
              />
              {errors.nama_supplier && <p className="text-xs text-destructive">{errors.nama_supplier}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kontak_person">Kontak Person</Label>
              <Input
                id="kontak_person"
                value={formData.kontak_person}
                onChange={(e) => setFormData({ ...formData, kontak_person: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="08xx / +62xx"
                className={errors.telepon ? 'border-destructive' : ''}
              />
              {errors.telepon && <p className="text-xs text-destructive">{errors.telepon}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className={errors.website ? 'border-destructive' : ''}
              />
              {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota">Kota</Label>
              <Input
                id="kota"
                value={formData.kota}
                onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provinsi">Provinsi</Label>
              <Input
                id="provinsi"
                value={formData.provinsi}
                onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                maxLength={50}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alamat">Alamat Lengkap</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                maxLength={500}
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                maxLength={500}
                rows={2}
              />
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
              {loading ? 'Menyimpan...' : (item ? 'Simpan Perubahan' : 'Tambah Supplier')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierForm;

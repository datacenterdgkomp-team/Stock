
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { logActivity } from '@/lib/ActivityLogHelper.js';

const EditAbsenModal = ({ isOpen, onClose, record, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    jam_masuk: '',
    jam_keluar: '',
    lokasi_masuk: '',
    lokasi_keluar: '',
    keterangan: '',
    nama_pegawai: ''
  });
  const [fotoMasuk, setFotoMasuk] = useState(null);
  const [fotoKeluar, setFotoKeluar] = useState(null);

  useEffect(() => {
    if (record && isOpen) {
      setFormData({
        status: record.status || '',
        jam_masuk: record.jam_masuk || '',
        jam_keluar: record.jam_keluar || '',
        lokasi_masuk: record.lokasi_masuk || '',
        lokasi_keluar: record.lokasi_keluar || '',
        keterangan: record.keterangan || '',
        nama_pegawai: record.nama_pegawai || ''
      });
      setFotoMasuk(null);
      setFotoKeluar(null);
    }
  }, [record, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.status || !formData.jam_masuk || !formData.lokasi_masuk) {
      toast.error('Harap isi field yang wajib (Status, Jam Masuk, Lokasi Masuk)');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('status', formData.status);
      data.append('jam_masuk', formData.jam_masuk);
      data.append('jam_keluar', formData.jam_keluar);
      data.append('lokasi_masuk', formData.lokasi_masuk);
      data.append('lokasi_keluar', formData.lokasi_keluar);
      data.append('keterangan', formData.keterangan);
      
      if (fotoMasuk) {
        data.append('foto_masuk', fotoMasuk);
      }
      if (fotoKeluar) {
        data.append('foto_keluar', fotoKeluar);
      }

      await pb.collection('absen_pegawai').update(record.id, data, { $autoCancel: false });
      await logActivity('Edit Absen', 'Lainnya', `Mengedit data absen untuk ${formData.nama_pegawai}`, 'Sukses');
      
      toast.success('Data absen berhasil diperbarui');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui data absen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Absen</DialogTitle>
          <DialogDescription>Perbarui informasi absensi pegawai. Kosongkan unggahan foto jika tidak ingin mengubahnya.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Pegawai</Label>
                <Input value={formData.nama_pegawai} readOnly className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Status <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({...formData, status: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hadir">Hadir</SelectItem>
                    <SelectItem value="Izin">Izin</SelectItem>
                    <SelectItem value="Sakit">Sakit</SelectItem>
                    <SelectItem value="Terlambat">Terlambat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jam Masuk <span className="text-destructive">*</span></Label>
                <Input 
                  value={formData.jam_masuk} 
                  onChange={(e) => setFormData({...formData, jam_masuk: e.target.value})} 
                  placeholder="Contoh: 08:00:00"
                />
              </div>
              <div className="space-y-2">
                <Label>Jam Keluar</Label>
                <Input 
                  value={formData.jam_keluar} 
                  onChange={(e) => setFormData({...formData, jam_keluar: e.target.value})} 
                  placeholder="Contoh: 17:00:00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokasi Masuk (Lat, Lng) <span className="text-destructive">*</span></Label>
                <Input 
                  value={formData.lokasi_masuk} 
                  onChange={(e) => setFormData({...formData, lokasi_masuk: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Lokasi Keluar (Lat, Lng)</Label>
                <Input 
                  value={formData.lokasi_keluar} 
                  onChange={(e) => setFormData({...formData, lokasi_keluar: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4 mt-2">
              <div className="space-y-2">
                <Label>Ganti Foto Masuk</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFotoMasuk(e.target.files[0])}
                    className="cursor-pointer file:text-primary file:font-medium file:bg-primary/10 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md hover:file:bg-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ganti Foto Keluar</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFotoKeluar(e.target.files[0])}
                    className="cursor-pointer file:text-primary file:font-medium file:bg-primary/10 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md hover:file:bg-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label>Keterangan / Catatan</Label>
              <Textarea 
                value={formData.keterangan} 
                onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                placeholder="Catatan izin, sakit, atau lainnya..."
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAbsenModal;

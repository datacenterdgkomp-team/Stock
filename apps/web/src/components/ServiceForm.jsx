
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
import { Separator } from '@/components/ui/separator';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import AccessoriesChecklistField from './AccessoriesChecklistField.jsx';
import PhotoUploadField from './PhotoUploadField.jsx';
import { Loader2 } from 'lucide-react';

const ServiceForm = ({ open, onClose, service, onSuccess, onPhotosChange }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomor_service: '',
    tanggal: '',
    customer_name: '',
    nomor_hp: '',
    barang_service: '',
    keluhan: '',
    status: 'Pending',
    biaya_service: '',
    teknisi: '',
    aksesori_lainnya: ''
  });

  const [kelengkapanIds, setKelengkapanIds] = useState([]);
  const [photoData, setPhotoData] = useState({ newFiles: [], deletedExisting: [] });

  useEffect(() => {
    if (service) {
      setFormData({
        nomor_service: service.nomor_service || '',
        tanggal: service.tanggal ? service.tanggal.split('T')[0] : '',
        customer_name: service.customer_name || '',
        nomor_hp: service.nomor_hp || '',
        barang_service: service.barang_service || '',
        keluhan: service.keluhan || '',
        status: service.status || 'Pending',
        biaya_service: service.biaya_service || '',
        teknisi: service.teknisi || '',
        aksesori_lainnya: service.aksesori_lainnya || ''
      });
      
      // Handle legacy string array or new ID array
      let parsedKelengkapan = [];
      if (Array.isArray(service.kelengkapan)) {
        parsedKelengkapan = service.kelengkapan;
      } else if (typeof service.kelengkapan === 'string' && service.kelengkapan) {
        try {
          parsedKelengkapan = JSON.parse(service.kelengkapan);
        } catch (e) {
          parsedKelengkapan = [];
        }
      }
      setKelengkapanIds(parsedKelengkapan);
      
    } else {
      setFormData({
        nomor_service: `SRV-${Date.now().toString().slice(-6)}`,
        tanggal: new Date().toISOString().split('T')[0],
        customer_name: '',
        nomor_hp: '',
        barang_service: '',
        keluhan: '',
        status: 'Pending',
        biaya_service: '',
        teknisi: '',
        aksesori_lainnya: ''
      });
      setKelengkapanIds([]);
    }
    setPhotoData({ newFiles: [], deletedExisting: [] });
  }, [service, open]);

  const handlePhotosChange = (data) => {
    setPhotoData(data);
    if (typeof onPhotosChange === 'function') {
      onPhotosChange(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      submitData.append('nomor_service', formData.nomor_service);
      submitData.append('tanggal', formData.tanggal ? `${formData.tanggal} 12:00:00.000Z` : '');
      submitData.append('customer_name', formData.customer_name);
      submitData.append('nomor_hp', formData.nomor_hp);
      submitData.append('barang_service', formData.barang_service);
      submitData.append('keluhan', formData.keluhan);
      submitData.append('status', formData.status);
      submitData.append('teknisi', formData.teknisi);
      submitData.append('biaya_service', formData.biaya_service ? parseFloat(formData.biaya_service).toString() : '0');
      submitData.append('aksesori_lainnya', formData.aksesori_lainnya);
      
      submitData.append('kelengkapan', JSON.stringify(kelengkapanIds));

      photoData.newFiles.forEach((file) => {
        submitData.append('foto_barang', file);
      });

      photoData.deletedExisting.forEach((filename) => {
        submitData.append('foto_barang-', filename);
      });

      if (service) {
        await pb.collection('jasa_service').update(service.id, submitData, { $autoCancel: false });
        toast.success('Service berhasil diupdate');
      } else {
        await pb.collection('jasa_service').create(submitData, { $autoCancel: false });
        toast.success('Service berhasil ditambahkan');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Gagal menyimpan service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !loading && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-xl">{service ? 'Edit Jasa Service' : 'Tambah Jasa Service'}</DialogTitle>
        </DialogHeader>

        <form id="service-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-primary border-b pb-2">Data Pelanggan</h3>
              
              <div className="space-y-2">
                <Label htmlFor="customer_name">Nama Customer <span className="text-destructive">*</span></Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomor_hp">Nomor HP <span className="text-destructive">*</span></Label>
                <Input
                  id="nomor_hp"
                  value={formData.nomor_hp}
                  onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomor_service">Nomor Service <span className="text-destructive">*</span></Label>
                <Input
                  id="nomor_service"
                  value={formData.nomor_service}
                  onChange={(e) => setFormData({ ...formData, nomor_service: e.target.value })}
                  required
                  disabled={!!service}
                  className="bg-muted/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal Masuk <span className="text-destructive">*</span></Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-primary border-b pb-2">Informasi Barang</h3>
              
              <div className="space-y-2">
                <Label htmlFor="barang_service">Barang yang Diservice <span className="text-destructive">*</span></Label>
                <Input
                  id="barang_service"
                  value={formData.barang_service}
                  onChange={(e) => setFormData({ ...formData, barang_service: e.target.value })}
                  required
                  className="bg-background"
                  placeholder="Contoh: Laptop ASUS ROG Strix"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keluhan">Keluhan Detail</Label>
                <Textarea
                  id="keluhan"
                  value={formData.keluhan}
                  onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                  rows={4}
                  className="bg-background resize-none"
                  placeholder="Jelaskan masalah yang dialami pelanggan..."
                />
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-6">
            <h3 className="font-medium text-primary border-b pb-2">Kelengkapan & Foto</h3>
            
            <AccessoriesChecklistField 
              selectedIds={kelengkapanIds} 
              onChange={setKelengkapanIds} 
            />

            <div className="space-y-2">
              <Label htmlFor="aksesori_lainnya">Aksesori Lainnya (Opsional)</Label>
              <Textarea
                id="aksesori_lainnya"
                value={formData.aksesori_lainnya}
                onChange={(e) => setFormData({ ...formData, aksesori_lainnya: e.target.value })}
                rows={2}
                maxLength={500}
                className="bg-background resize-none"
                placeholder="Masukkan aksesori lainnya yang tidak ada di list (pisahkan dengan koma)"
              />
            </div>
            
            <PhotoUploadField 
              existingPhotos={service?.foto_barang || []}
              record={service}
              onPhotosChange={handlePhotosChange}
              isUploading={loading}
              maxPhotos={10}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-primary border-b pb-2">Progres & Biaya</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status Pengerjaan</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Proses">Proses</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                    <SelectItem value="Diambil">Diambil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teknisi">Penanggung Jawab (Teknisi)</Label>
                <Input
                  id="teknisi"
                  value={formData.teknisi}
                  onChange={(e) => setFormData({ ...formData, teknisi: e.target.value })}
                  className="bg-background"
                  placeholder="Nama teknisi..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="biaya_service">Estimasi/Total Biaya</Label>
                <Input
                  id="biaya_service"
                  type="number"
                  min="0"
                  value={formData.biaya_service}
                  onChange={(e) => setFormData({ ...formData, biaya_service: e.target.value })}
                  className="bg-background font-mono"
                  placeholder="Rp 0"
                />
              </div>
            </div>
          </div>
        </form>
        
        <DialogFooter className="p-6 pt-4 border-t bg-card shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" form="service-form" disabled={loading} className="min-w-[120px]">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
            ) : (
              service ? 'Simpan Perubahan' : 'Tambah Service'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceForm;

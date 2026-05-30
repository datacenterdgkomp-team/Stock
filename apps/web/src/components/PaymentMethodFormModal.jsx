
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
import { Switch } from '@/components/ui/switch';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import QRISImageUploadField from './QRISImageUploadField.jsx';

const PaymentMethodFormModal = ({ open, onClose, item, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    tipe_metode: 'tunai',
    nomor_rekening: '',
    status: 'aktif'
  });
  const [qrisFile, setQrisFile] = useState(null);
  const [qrisFileDeleted, setQrisFileDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        nama: item.nama || '',
        deskripsi: item.deskripsi || '',
        tipe_metode: item.tipe_metode || 'tunai',
        nomor_rekening: item.nomor_rekening || '',
        status: item.status || 'aktif'
      });
    } else {
      setFormData({
        nama: '',
        deskripsi: '',
        tipe_metode: 'tunai',
        nomor_rekening: '',
        status: 'aktif'
      });
    }
    setQrisFile(null);
    setQrisFileDeleted(false);
    setErrors({});
  }, [item, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nama || formData.nama.length < 3 || formData.nama.length > 100) {
      newErrors.nama = 'Nama harus antara 3 hingga 100 karakter';
    }
    if (formData.deskripsi && formData.deskripsi.length > 200) {
      newErrors.deskripsi = 'Deskripsi maksimal 200 karakter';
    }
    if (formData.nomor_rekening && formData.nomor_rekening.length > 100) {
      newErrors.nomor_rekening = 'Nomor rekening maksimal 100 karakter';
    }
    
    // QRIS image validation (optional but good practice to enforce if QRIS selected)
    if (formData.tipe_metode === 'qris' && !item?.qris_image && !qrisFile && !qrisFileDeleted) {
      // It's optional per schema, but highly recommended to have image if type is QRIS
      // Removing strict validation here so they can add it later, but warn them.
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('nama', formData.nama);
      payload.append('deskripsi', formData.deskripsi);
      payload.append('tipe_metode', formData.tipe_metode);
      payload.append('nomor_rekening', formData.nomor_rekening);
      payload.append('status', formData.status);

      if (formData.tipe_metode === 'qris') {
        if (qrisFile) {
          payload.append('qris_image', qrisFile);
        } else if (qrisFileDeleted) {
          payload.append('qris_image', ''); // Clear existing image
        }
      } else if (item?.qris_image) {
        // If type changed away from QRIS, remove the image
        payload.append('qris_image', '');
      }

      if (item) {
        await pb.collection('metode_pembayaran').update(item.id, payload, { $autoCancel: false });
        toast.success('Metode pembayaran berhasil diperbarui');
      } else {
        await pb.collection('metode_pembayaran').create(payload, { $autoCancel: false });
        toast.success('Metode pembayaran berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
      if (error.response?.data?.nama?.code === 'validation_not_unique') {
        setErrors({ nama: 'Nama metode pembayaran sudah digunakan' });
        toast.error('Nama metode pembayaran sudah digunakan');
      } else {
        toast.error(item ? 'Gagal memperbarui metode pembayaran' : 'Gagal menambahkan metode pembayaran');
      }
    } finally {
      setLoading(false);
    }
  };

  const existingQrisUrl = item?.qris_image && formData.tipe_metode === 'qris' && !qrisFileDeleted
    ? pb.files.getUrl(item, item.qris_image) 
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Metode <span className="text-destructive">*</span></Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Transfer BCA atau QRIS Toko"
              className={errors.nama ? 'border-destructive' : ''}
            />
            {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipe_metode">Tipe Metode</Label>
            <Select 
              value={formData.tipe_metode} 
              onValueChange={(value) => setFormData({ ...formData, tipe_metode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tunai">Tunai</SelectItem>
                <SelectItem value="transfer_bank">Transfer Bank</SelectItem>
                <SelectItem value="kartu_kredit">Kartu Kredit</SelectItem>
                <SelectItem value="e_wallet">E-Wallet</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="cek">Cek</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipe_metode === 'qris' && (
            <div className="space-y-3 p-4 bg-muted/20 border rounded-xl animate-in fade-in slide-in-from-top-2">
              <div>
                <Label>Gambar QRIS (Opsional)</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                  Upload gambar QRIS agar pelanggan dapat langsung melakukan scan.
                </p>
              </div>
              <QRISImageUploadField 
                existingImageUrl={existingQrisUrl}
                onFileSelect={(file) => {
                  setQrisFile(file);
                  setQrisFileDeleted(false);
                }}
                onRemove={() => {
                  setQrisFile(null);
                  setQrisFileDeleted(true);
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nomor_rekening">Nomor Rekening / Identitas</Label>
            <Input
              id="nomor_rekening"
              value={formData.nomor_rekening}
              onChange={(e) => setFormData({ ...formData, nomor_rekening: e.target.value })}
              placeholder="Opsional (Misal: 123456789 a/n Budi)"
              className={errors.nomor_rekening ? 'border-destructive' : ''}
            />
            {errors.nomor_rekening && <p className="text-xs text-destructive">{errors.nomor_rekening}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Instruksi tambahan (Opsional)"
              rows={3}
              className={`resize-none ${errors.deskripsi ? 'border-destructive' : ''}`}
            />
            {errors.deskripsi && <p className="text-xs text-destructive">{errors.deskripsi}</p>}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label>Status Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Metode bayar {formData.status === 'aktif' ? 'akan' : 'tidak akan'} ditampilkan di kasir
              </p>
            </div>
            <Switch
              checked={formData.status === 'aktif'}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'aktif' : 'nonaktif' })}
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodFormModal;

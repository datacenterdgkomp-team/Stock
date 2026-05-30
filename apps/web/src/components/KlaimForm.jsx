
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

const KlaimForm = ({ open, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomor_klaim: '',
    tanggal: '',
    customer_name: '',
    barang_name: '',
    nomor_seri: '',
    tanggal_beli: '',
    keluhan: '',
    status: 'Pending',
    hasil_klaim: 'Perbaikan',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        nomor_klaim: item.nomor_klaim || '',
        tanggal: item.tanggal ? item.tanggal.split('T')[0] : '',
        customer_name: item.customer_name || '',
        barang_name: item.barang_name || '',
        nomor_seri: item.nomor_seri || '',
        tanggal_beli: item.tanggal_beli ? item.tanggal_beli.split('T')[0] : '',
        keluhan: item.keluhan || '',
        status: item.status || 'Pending',
        hasil_klaim: item.hasil_klaim || 'Perbaikan',
      });
    } else {
      setFormData({
        nomor_klaim: `KLM-${Date.now().toString().slice(-6)}`,
        tanggal: new Date().toISOString().split('T')[0],
        customer_name: '',
        barang_name: '',
        nomor_seri: '',
        tanggal_beli: '',
        keluhan: '',
        status: 'Pending',
        hasil_klaim: 'Perbaikan',
      });
    }
  }, [item, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        tanggal: formData.tanggal ? `${formData.tanggal} 12:00:00.000Z` : '',
        tanggal_beli: formData.tanggal_beli ? `${formData.tanggal_beli} 12:00:00.000Z` : '',
      };

      if (item) {
        await pb.collection('klaim_garansi').update(item.id, data, { $autoCancel: false });
        toast.success('Klaim garansi berhasil diupdate');
      } else {
        await pb.collection('klaim_garansi').create(data, { $autoCancel: false });
        toast.success('Klaim garansi berhasil ditambahkan');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Klaim Garansi' : 'Tambah Klaim Garansi'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomor_klaim">Nomor Klaim *</Label>
              <Input
                id="nomor_klaim"
                value={formData.nomor_klaim}
                onChange={(e) => setFormData({ ...formData, nomor_klaim: e.target.value })}
                required
                disabled={!!item}
                className="text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                required
                className="text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="customer_name">Nama Customer *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
                className="text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="barang_name">Nama Barang *</Label>
              <Input
                id="barang_name"
                value={formData.barang_name}
                onChange={(e) => setFormData({ ...formData, barang_name: e.target.value })}
                required
                className="text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="nomor_seri">Nomor Seri</Label>
              <Input
                id="nomor_seri"
                value={formData.nomor_seri}
                onChange={(e) => setFormData({ ...formData, nomor_seri: e.target.value })}
                className="text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="tanggal_beli">Tanggal Beli</Label>
              <Input
                id="tanggal_beli"
                type="date"
                value={formData.tanggal_beli}
                onChange={(e) => setFormData({ ...formData, tanggal_beli: e.target.value })}
                className="text-foreground"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="keluhan">Keluhan</Label>
              <Textarea
                id="keluhan"
                value={formData.keluhan}
                onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                rows={3}
                className="text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Diproses">Diproses</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hasil_klaim">Hasil Klaim</Label>
              <Select value={formData.hasil_klaim} onValueChange={(value) => setFormData({ ...formData, hasil_klaim: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganti Barang">Ganti Barang</SelectItem>
                  <SelectItem value="Perbaikan">Perbaikan</SelectItem>
                  <SelectItem value="Tolak">Tolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KlaimForm;

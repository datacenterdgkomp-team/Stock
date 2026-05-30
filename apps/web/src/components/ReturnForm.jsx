
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

const ReturnForm = ({ open, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomor_return: '',
    tanggal: '',
    nomor_transaksi: '',
    barang_name: '',
    qty: '',
    alasan_return: 'Rusak',
    status: 'Pending',
    catatan: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        nomor_return: item.nomor_return || '',
        tanggal: item.tanggal ? item.tanggal.split('T')[0] : '',
        nomor_transaksi: item.nomor_transaksi || '',
        barang_name: item.barang_name || '',
        qty: item.qty || '',
        alasan_return: item.alasan_return || 'Rusak',
        status: item.status || 'Pending',
        catatan: item.catatan || '',
      });
    } else {
      setFormData({
        nomor_return: `RET-${Date.now().toString().slice(-6)}`,
        tanggal: new Date().toISOString().split('T')[0],
        nomor_transaksi: '',
        barang_name: '',
        qty: '1',
        alasan_return: 'Rusak',
        status: 'Pending',
        catatan: '',
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
        qty: parseInt(formData.qty) || 1,
      };

      if (item) {
        await pb.collection('return_barang').update(item.id, data, { $autoCancel: false });
        toast.success('Data return berhasil diupdate');
      } else {
        await pb.collection('return_barang').create(data, { $autoCancel: false });
        toast.success('Data return berhasil ditambahkan');
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Return Barang' : 'Tambah Return Barang'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomor_return">Nomor Return *</Label>
              <Input
                id="nomor_return"
                value={formData.nomor_return}
                onChange={(e) => setFormData({ ...formData, nomor_return: e.target.value })}
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
              <Label htmlFor="nomor_transaksi">Nomor Transaksi *</Label>
              <Input
                id="nomor_transaksi"
                value={formData.nomor_transaksi}
                onChange={(e) => setFormData({ ...formData, nomor_transaksi: e.target.value })}
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
              <Label htmlFor="qty">Qty *</Label>
              <Input
                id="qty"
                type="number"
                min="1"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                required
                className="text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="alasan_return">Alasan Return</Label>
              <Select value={formData.alasan_return} onValueChange={(value) => setFormData({ ...formData, alasan_return: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rusak">Rusak</SelectItem>
                  <SelectItem value="Salah Barang">Salah Barang</SelectItem>
                  <SelectItem value="Tidak Sesuai">Tidak Sesuai</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Disetujui">Disetujui</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                rows={3}
                className="text-foreground"
              />
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

export default ReturnForm;

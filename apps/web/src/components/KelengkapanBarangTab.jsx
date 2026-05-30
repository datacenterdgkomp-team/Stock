
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Edit, Trash2, Plus, Loader2, CheckSquare } from 'lucide-react';
import { useKelengkapanBarang } from '@/hooks/useKelengkapanBarang';
import pb from '@/lib/pocketbaseClient';

const KelengkapanBarangTab = () => {
  const { 
    fetchKelengkapanBarang, 
    addKelengkapanBarang, 
    updateKelengkapanBarang, 
    deleteKelengkapanBarang,
    loading: actionLoading 
  } = useKelengkapanBarang();

  const [items, setItems] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    nama_kelengkapan: '',
    deskripsi: '',
    kategori: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kelengkapanData, kategoriData] = await Promise.all([
        fetchKelengkapanBarang(),
        pb.collection('kategori_barang').getFullList({ sort: 'nama_kategori', $autoCancel: false })
      ]);
      setItems(kelengkapanData);
      setKategoriList(kategoriData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, kategori: value === 'none' ? '' : value }));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nama_kelengkapan: '',
      deskripsi: '',
      kategori: ''
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_kelengkapan.trim()) return;

    const dataToSubmit = {
      nama_kelengkapan: formData.nama_kelengkapan.trim(),
      deskripsi: formData.deskripsi.trim(),
      kategori: formData.kategori || null
    };

    try {
      if (isEditing) {
        await updateKelengkapanBarang(formData.id, dataToSubmit);
      } else {
        await addKelengkapanBarang(dataToSubmit);
      }
      resetForm();
      loadData();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nama_kelengkapan: item.nama_kelengkapan,
      deskripsi: item.deskripsi || '',
      kategori: item.kategori || ''
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteKelengkapanBarang(deleteId);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setDeleteId(null);
    }
  };

  const filteredItems = items.filter(item => 
    item.nama_kelengkapan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-card border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            {isEditing ? 'Edit Kelengkapan Barang' : 'Tambah Kelengkapan Barang'}
          </CardTitle>
          <CardDescription>
            Kelola daftar kelengkapan (aksesoris, kabel, dll) yang sering disertakan saat service barang.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_kelengkapan">Nama Kelengkapan <span className="text-destructive">*</span></Label>
                  <Input
                    id="nama_kelengkapan"
                    name="nama_kelengkapan"
                    value={formData.nama_kelengkapan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kabel Power, Adaptor..."
                    maxLength={100}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori (Opsional)</Label>
                  <Select value={formData.kategori || 'none'} onValueChange={handleSelectChange}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground italic">-- Tidak Ada Kategori --</SelectItem>
                      {kategoriList.map(kat => (
                        <SelectItem key={kat.id} value={kat.id}>{kat.nama_kategori}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                <Textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  placeholder="Keterangan tambahan..."
                  maxLength={500}
                  rows={4}
                  className="bg-background resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm} disabled={actionLoading}>
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={actionLoading || !formData.nama_kelengkapan.trim()}>
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Simpan Perubahan' : 'Tambah Kelengkapan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-card border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Daftar Kelengkapan</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kelengkapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[50px] text-center">No</TableHead>
                    <TableHead>Nama Kelengkapan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.nama_kelengkapan}</TableCell>
                        <TableCell>
                          {item.expand?.kategori?.nama_kategori ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                              {item.expand.kategori.nama_kategori}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate" title={item.deskripsi}>
                          {item.deskripsi || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => setDeleteId(item.id)}
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        {searchQuery ? 'Tidak ada kelengkapan yang cocok dengan pencarian.' : 'Belum ada data kelengkapan barang.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kelengkapan Barang</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kelengkapan ini? Tindakan ini tidak dapat dibatalkan.
              Jika kelengkapan ini sedang digunakan pada data service, penghapusan akan ditolak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KelengkapanBarangTab;

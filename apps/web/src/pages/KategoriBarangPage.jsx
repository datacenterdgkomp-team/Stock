
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import KategoriForm from '@/components/KategoriForm.jsx';

const KategoriBarangPage = () => {
  const { items, isLoading, fetchItems, createItem, updateItem, deleteItem } = useSystemSettings('kategori');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems(1, 50, searchQuery, statusFilter);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, fetchItems]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteItem(deleteId);
      setDeleteId(null);
      fetchItems(1, 50, searchQuery, statusFilter);
    }
  };

  const handleSubmit = async (data) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await createItem(data);
    }
    fetchItems(1, 50, searchQuery, statusFilter);
  };

  return (
    <>
      <Helmet>
        <title>Kategori Barang - Pengaturan Sistem</title>
      </Helmet>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kategori Barang</h1>
            <p className="text-muted-foreground">Kelola kategori produk untuk inventori</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori Baru
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Memuat data...</TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada kategori ditemukan</TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {item.deskripsi || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'aktif' ? 'default' : 'secondary'} className={item.status === 'aktif' ? 'bg-success hover:bg-success/90' : ''}>
                            {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.created).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setDeleteId(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <KategoriForm
        open={showForm}
        onClose={() => setShowForm(false)}
        item={editingItem}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori ini? Barang dengan kategori ini akan tetap ada namun kehilangan referensi kategorinya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KategoriBarangPage;

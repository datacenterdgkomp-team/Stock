
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Loader2, Inbox, Tags } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import KategoriPengeluaranForm from './KategoriPengeluaranForm.jsx';
import { getIcon } from '@/lib/iconMap.js';

const KategoriPengeluaranTab = () => {
  const { currentUser } = useAuth();
  const hasFullAccess = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const hasNoAccess = currentUser?.role === 'Kasir';
  
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = useCallback(async () => {
    if (hasNoAccess) return;
    
    setIsLoading(true);
    try {
      const options = {
        sort: 'nama_kategori',
        $autoCancel: false,
      };

      if (searchQuery) {
        options.filter = `nama_kategori ~ "${searchQuery}"`;
      }

      const records = await pb.collection('kategori_pengeluaran').getList(page, perPage, options);
      setItems(records.items);
      setTotalItems(records.totalItems);
    } catch (error) {
      console.error('Error fetching kategori pengeluaran:', error);
      toast.error('Gagal memuat data kategori pengeluaran');
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, searchQuery, hasNoAccess]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchItems]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // Check if category is in use
      const category = items.find(i => i.id === deleteId);
      if (category) {
        const inUse = await pb.collection('pengeluaran_harian').getList(1, 1, {
          filter: `kategori_pengeluaran = "${category.nama_kategori}"`,
          $autoCancel: false
        });
        
        if (inUse.totalItems > 0) {
          toast.error('Kategori tidak dapat dihapus karena sedang digunakan dalam data pengeluaran');
          setDeleteId(null);
          return;
        }
      }

      await pb.collection('kategori_pengeluaran').delete(deleteId, { $autoCancel: false });
      toast.success('Kategori berhasil dihapus');
      setDeleteId(null);
      fetchItems();
    } catch (error) {
      console.error('Error deleting kategori:', error);
      toast.error('Gagal menghapus kategori');
    }
  };

  if (hasNoAccess) {
    return (
      <Card className="shadow-sm border-border">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <Tags className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Akses Ditolak</h2>
          <p className="text-muted-foreground mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </CardContent>
      </Card>
    );
  }

  const renderIcon = (iconName, color) => {
    const IconComponent = getIcon(iconName) || getIcon('HelpCircle');
    return <IconComponent className="w-5 h-5" style={{ color: color || 'currentColor' }} />;
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="p-4 md:p-6 border-b bg-card rounded-t-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-primary" />
              Kategori Pengeluaran
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Kelola daftar kategori untuk pencatatan pengeluaran harian.</p>
          </div>
          {hasFullAccess && (
            <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama kategori..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead className="w-[80px]">Warna</TableHead>
                <TableHead className="w-[80px]">Icon</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                {hasFullAccess && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={hasFullAccess ? 6 : 5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary/50" />
                      <p>Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasFullAccess ? 6 : 5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Inbox className="w-12 h-12 mb-3 text-muted-foreground/30" />
                      <p className="text-base font-medium text-foreground">Tidak ada data ditemukan</p>
                      <p className="text-sm">Coba sesuaikan pencarian Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>{(page - 1) * perPage + index + 1}</TableCell>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full border shadow-sm" 
                        style={{ backgroundColor: item.warna || '#e2e8f0' }}
                        title={item.warna}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border shadow-sm">
                        {renderIcon(item.icon, item.warna)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.nama_kategori}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                      {item.deskripsi || '-'}
                    </TableCell>
                    {hasFullAccess && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => setDeleteId(item.id)} className="h-8 w-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalItems > perPage && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, totalItems)} dari {totalItems} data
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * perPage >= totalItems || isLoading}>
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {hasFullAccess && (
        <>
          <KategoriPengeluaranForm
            open={showForm}
            onClose={() => setShowForm(false)}
            item={editingItem}
            onSuccess={fetchItems}
          />

          <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus kategori ini? Data yang dihapus tidak dapat dikembalikan.
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
      )}
    </Card>
  );
};

export default KategoriPengeluaranTab;

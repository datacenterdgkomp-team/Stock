
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Loader2, Inbox } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import SystemSettingForm from '@/components/SystemSettingForm.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const SystemSettingTab = ({ collectionName, title, description, minLength = 3 }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  
  const { items, totalItems, isLoading, fetchItems, createItem, updateItem, deleteItem } = useSystemSettings(collectionName);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems(page, perPage, searchQuery, statusFilter);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, page, fetchItems]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteItem(deleteId);
      setDeleteId(null);
      fetchItems(page, perPage, searchQuery, statusFilter);
    }
  };

  const handleSubmit = async (data) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await createItem(data);
    }
    fetchItems(page, perPage, searchQuery, statusFilter);
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="p-4 md:p-6 border-b bg-card rounded-t-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          {isAdmin && (
            <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah {title}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau deskripsi..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama {title}</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary/50" />
                      <p>Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Inbox className="w-12 h-12 mb-3 text-muted-foreground/30" />
                      <p className="text-base font-medium text-foreground">Tidak ada data ditemukan</p>
                      <p className="text-sm">Coba sesuaikan filter atau pencarian Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>{(page - 1) * perPage + index + 1}</TableCell>
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
                    {isAdmin && (
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

      {isAdmin && (
        <>
          <SystemSettingForm
            open={showForm}
            onClose={() => setShowForm(false)}
            item={editingItem}
            onSubmit={handleSubmit}
            title={title}
            minLength={minLength}
          />

          <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus {title}</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus {title.toLowerCase()} ini? Barang dengan {title.toLowerCase()} ini akan tetap ada namun kehilangan referensinya.
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

export default SystemSettingTab;

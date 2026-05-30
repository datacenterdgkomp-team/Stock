
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import ReturnForm from '@/components/ReturnForm.jsx';
import pb from '@/lib/pocketbaseClient';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';

const ReturnBarangPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadItems();
  }, [statusFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const options = {
        sort: '-tanggal',
        $autoCancel: false,
      };
      
      if (statusFilter !== 'all') {
        options.filter = `status = "${statusFilter}"`;
      }

      const records = await pb.collection('return_barang').getList(1, 100, options);
      setItems(records.items);
    } catch (error) {
      toast.error('Gagal memuat data return');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await pb.collection('return_barang').delete(deleteId, { $autoCancel: false });
      toast.success('Data return berhasil dihapus');
      loadItems();
      setDeleteId(null);
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Disetujui': return <Badge className="bg-green-500">Disetujui</Badge>;
      case 'Ditolak': return <Badge variant="destructive">Ditolak</Badge>;
      case 'Pending': return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Pending</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Return Barang - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 bg-secondary/20">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Return Barang</h1>
              <p className="text-muted-foreground">Kelola pengembalian barang dari pelanggan</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <CardTitle>Daftar Return</CardTitle>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Disetujui">Disetujui</SelectItem>
                        <SelectItem value="Ditolak">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => { setEditingItem(null); setShowForm(true); }}>
                      <Plus className="w-4 h-4 mr-2" /> Tambah Return
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No. Return</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>No. Transaksi</TableHead>
                          <TableHead>Barang</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Alasan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{item.nomor_return}</TableCell>
                            <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>{item.nomor_transaksi}</TableCell>
                            <TableCell>{item.barang_name}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.alasan_return}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => setDeleteId(item.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {items.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              Tidak ada data return.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        <Footer />
      </div>

      <ReturnForm
        open={showForm}
        onClose={() => setShowForm(false)}
        item={editingItem}
        onSuccess={loadItems}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Return</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data return ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReturnBarangPage;

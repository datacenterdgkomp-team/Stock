
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
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import PengeluaranForm from '@/components/PengeluaranForm.jsx';
import pb from '@/lib/pocketbaseClient';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';

const PengeluaranHarianPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [totalHariIni, setTotalHariIni] = useState(0);

  useEffect(() => {
    loadItems();
  }, [kategoriFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const options = {
        sort: '-tanggal',
        $autoCancel: false,
      };
      
      if (kategoriFilter !== 'all') {
        options.filter = `kategori_pengeluaran = "${kategoriFilter}"`;
      }

      const records = await pb.collection('pengeluaran_harian').getList(1, 100, options);
      setItems(records.items);

      // Kalkulasi total hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0] + " 00:00:00.000Z";
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0] + " 00:00:00.000Z";

      const todayRecords = await pb.collection('pengeluaran_harian').getFullList({
        filter: `tanggal >= "${todayStr}" && tanggal < "${tomorrowStr}"`,
        $autoCancel: false
      });
      const total = todayRecords.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      setTotalHariIni(total);

    } catch (error) {
      toast.error('Gagal memuat data pengeluaran');
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
      await pb.collection('pengeluaran_harian').delete(deleteId, { $autoCancel: false });
      toast.success('Data pengeluaran berhasil dihapus');
      loadItems();
      setDeleteId(null);
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <>
      <Helmet>
        <title>Pengeluaran Harian - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 bg-secondary/20">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Pengeluaran Harian</h1>
                <p className="text-muted-foreground">Catat dan kelola pengeluaran toko</p>
              </div>
              <Card className="w-full md:w-auto bg-card border-l-4 border-l-destructive">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <DollarSign className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Hari Ini</p>
                    <p className="text-2xl font-bold text-destructive">Rp {totalHariIni.toLocaleString('id-ID')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <CardTitle>Daftar Pengeluaran</CardTitle>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        <SelectItem value="Gaji">Gaji</SelectItem>
                        <SelectItem value="Listrik">Listrik</SelectItem>
                        <SelectItem value="Internet">Internet</SelectItem>
                        <SelectItem value="Sewa">Sewa</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => { setEditingItem(null); setShowForm(true); }}>
                      <Plus className="w-4 h-4 mr-2" /> Tambah Pengeluaran
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
                          <TableHead>No. Ref</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{item.nomor_pengeluaran}</TableCell>
                            <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>{item.kategori_pengeluaran}</TableCell>
                            <TableCell>{item.deskripsi}</TableCell>
                            <TableCell className="text-right font-medium">Rp {item.jumlah.toLocaleString('id-ID')}</TableCell>
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
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Tidak ada data pengeluaran.
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

      <PengeluaranForm
        open={showForm}
        onClose={() => setShowForm(false)}
        item={editingItem}
        onSuccess={loadItems}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pengeluaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
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

export default PengeluaranHarianPage;

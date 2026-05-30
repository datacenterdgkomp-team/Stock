
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import BarangForm from '@/components/BarangForm.jsx';
import PhotoModal from '@/components/PhotoModal.jsx';
import ExcelDownloadButton from '@/components/ExcelDownloadButton.jsx';
import ExcelUploadButton from '@/components/ExcelUploadButton.jsx';
import ExcelTemplateDownload from '@/components/ExcelTemplateDownload.jsx';
import pb from '@/lib/pocketbaseClient';
import { Plus, Edit, Trash2, Search, FileImage as ImageIcon, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';

const BarangPage = () => {
  const { currentUser } = useAuth();
  
  const [barang, setBarang] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliersMap, setSuppliersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBarang, setEditingBarang] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const isAdminOrManager = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const isStaff = currentUser?.role === 'Staff';

  useEffect(() => {
    loadReferenceData().then(loadBarang);
  }, []);

  useEffect(() => {
    let filtered = [...barang];
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.nama.toLowerCase().includes(lowerQuery) ||
        b.kode_barang.toLowerCase().includes(lowerQuery) ||
        (b.supplier && suppliersMap[b.supplier]?.nama_supplier?.toLowerCase().includes(lowerQuery))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.kategori === selectedCategory);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'supplier_name') {
        aValue = a.supplier ? (suppliersMap[a.supplier]?.nama_supplier || '') : '';
        bValue = b.supplier ? (suppliersMap[b.supplier]?.nama_supplier || '') : '';
      } else if (sortConfig.key === 'kategori_name') {
        aValue = a.expand?.kategori?.nama || '';
        bValue = b.expand?.kategori?.nama || '';
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredBarang(filtered);
  }, [searchQuery, selectedCategory, barang, suppliersMap, sortConfig]);

  const loadBarang = async () => {
    try {
      const records = await pb.collection('barang').getFullList({
        expand: 'kategori',
        sort: '-created',
        $autoCancel: false
      });
      setBarang(records);
    } catch (error) {
      toast.error('Gagal memuat data barang');
    }
  };

  const loadReferenceData = async () => {
    try {
      const [katRecords, supRecords] = await Promise.all([
        pb.collection('kategori').getFullList({ $autoCancel: false }),
        pb.collection('supplier').getFullList({ $autoCancel: false })
      ]);
      setCategories(katRecords);
      const supMap = {};
      supRecords.forEach(s => { supMap[s.id] = s; });
      setSuppliersMap(supMap);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await pb.collection('barang').delete(deleteId, { $autoCancel: false });
      toast.success('Barang berhasil dihapus');
      loadBarang();
      setDeleteId(null);
    } catch (error) {
      toast.error('Gagal menghapus barang');
    }
  };

  const toggleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const SortableHeader = ({ label, sortKey }) => (
    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground select-none" onClick={() => toggleSort(sortKey)}>
      <span className="text-[12px]">{label}</span>
      <ArrowUpDown className={`w-3 h-3 ${sortConfig.key === sortKey ? 'text-primary' : 'text-muted-foreground/50'}`} />
    </div>
  );

  return (
    <>
      <Helmet><title>Barang - DG Komputer</title></Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 bg-secondary/20">
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h1 className="text-h2 font-bold mb-1 tracking-tight">Manajemen Barang</h1>
                <p className="text-body text-muted-foreground">Kelola inventori dan stok</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(isAdminOrManager || isStaff) && <ExcelTemplateDownload />}
                {(isAdminOrManager || isStaff) && <ExcelDownloadButton />}
                {isAdminOrManager && <ExcelUploadButton onSuccess={loadBarang} />}
                <Button onClick={() => setShowForm(true)} className="h-9 px-3 text-button shadow-sm">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Barang
                </Button>
              </div>
            </div>

            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-0 bg-card">
                <div className="flex flex-col sm:flex-row gap-3 p-3 border-b">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                    <Input placeholder="Cari nama/kode..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-9 text-body" />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9 text-body">
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[60px] text-center text-[12px]">Foto</TableHead>
                        <TableHead><SortableHeader label="Kode" sortKey="kode_barang" /></TableHead>
                        <TableHead><SortableHeader label="Nama Barang" sortKey="nama" /></TableHead>
                        <TableHead><SortableHeader label="Kategori" sortKey="kategori_name" /></TableHead>
                        <TableHead><SortableHeader label="Harga" sortKey="harga_jual" /></TableHead>
                        <TableHead><SortableHeader label="Stok" sortKey="stok" /></TableHead>
                        <TableHead className="text-right text-[12px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBarang.length > 0 ? filteredBarang.map(item => (
                        <TableRow key={item.id} className="hover:bg-muted/50 text-body">
                          <TableCell className="text-center p-2">
                            {item.photo ? (
                              <img src={pb.files.getUrl(item, item.photo, { thumb: '100x100f' })} alt="" className="w-8 h-8 rounded object-cover mx-auto cursor-pointer" onClick={() => { setSelectedPhoto({url: pb.files.getUrl(item, item.photo)}); setPhotoModalOpen(true); }}/>
                            ) : <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground/30" />}
                          </TableCell>
                          <TableCell className="text-small text-muted-foreground font-mono">{item.kode_barang}</TableCell>
                          <TableCell className="font-medium text-[13px]">{item.nama}</TableCell>
                          <TableCell className="text-small">{item.expand?.kategori?.nama || '-'}</TableCell>
                          <TableCell className="font-semibold text-primary">Rp {item.harga_jual.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={item.stok <= 0 ? 'destructive' : item.stok < 10 ? 'warning' : 'outline'} className="text-tiny">
                              {item.stok}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right p-2">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingBarang(item); setShowForm(true); }} className="h-7 w-7"><Edit className="w-3.5 h-3.5"/></Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteId(item.id)} className="h-7 w-7 text-destructive"><Trash2 className="w-3.5 h-3.5"/></Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={7} className="text-center p-8 text-muted-foreground">Tidak ada barang</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        <Footer />
      </div>

      <BarangForm open={showForm} onClose={() => { setShowForm(false); setEditingBarang(null); }} barang={editingBarang} onSuccess={loadBarang} />
      <PhotoModal open={photoModalOpen} onClose={() => setPhotoModalOpen(false)} photoUrl={selectedPhoto?.url} />
      
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle className="text-h2">Hapus Barang</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 text-button">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white h-9 text-button">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BarangPage;

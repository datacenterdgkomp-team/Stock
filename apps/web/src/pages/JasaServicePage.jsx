
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import ServiceForm from '@/components/ServiceForm.jsx';
import ServicePhotoGallery from '@/components/ServicePhotoGallery.jsx';
import AccessoriesDisplay from '@/components/AccessoriesDisplay.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Plus, Edit, Trash2, CheckCircle2, Eye, Image as ImageIcon, Phone, Wrench, Calendar, User, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';

const JasaServicePage = () => {
  const { currentUser } = useAuth();
  
  const [services, setServices] = useState([]);
  const [kelengkapanMap, setKelengkapanMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewDetailItem, setViewDetailItem] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'tanggal', direction: 'desc' });
  const [totalSelesai, setTotalSelesai] = useState(0);

  const isKasir = currentUser?.role === 'Kasir';
  const canEdit = !isKasir;

  useEffect(() => {
    loadReferenceData().then(() => {
      loadServices();
    });
  }, [statusFilter]);

  const loadReferenceData = async () => {
    try {
      const records = await pb.collection('kelengkapan_barang').getFullList({ $autoCancel: false });
      const map = {};
      records.forEach(r => { map[r.id] = r.nama_kelengkapan; });
      setKelengkapanMap(map);
    } catch (error) {
      console.error('Error loading kelengkapan reference:', error);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const options = {
        sort: '-tanggal',
        $autoCancel: false,
      };
      
      if (statusFilter !== 'all') {
        options.filter = `status = "${statusFilter}"`;
      }

      const records = await pb.collection('jasa_service').getFullList(options);
      setServices(records);

      const selesaiRecords = await pb.collection('jasa_service').getList(1, 1, {
        filter: `status = "Selesai"`,
        $autoCancel: false
      });
      setTotalSelesai(selesaiRecords.totalItems);
      
    } catch (error) {
      toast.error('Gagal memuat data service');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item, e) => {
    e?.stopPropagation();
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await pb.collection('jasa_service').delete(deleteId, { $autoCancel: false });
      toast.success('Service berhasil dihapus');
      loadServices();
      setDeleteId(null);
    } catch (error) {
      toast.error('Gagal menghapus service');
    }
  };

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getKelengkapanNames = (item) => {
    let names = [];
    if (Array.isArray(item.kelengkapan)) {
      names = item.kelengkapan.map(id => kelengkapanMap[id] || id);
    }
    if (item.aksesori_lainnya) {
      names.push(item.aksesori_lainnya);
    }
    return names;
  };

  const filteredAndSortedServices = React.useMemo(() => {
    let result = [...services];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => {
        const kelengkapanStr = getKelengkapanNames(item).join(' ').toLowerCase();
        return (
          item.nomor_service.toLowerCase().includes(lowerQuery) ||
          item.customer_name.toLowerCase().includes(lowerQuery) ||
          item.barang_service.toLowerCase().includes(lowerQuery) ||
          kelengkapanStr.includes(lowerQuery)
        );
      });
    }

    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'kelengkapan_str') {
        aValue = getKelengkapanNames(a).join(', ');
        bValue = getKelengkapanNames(b).join(', ');
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [services, searchQuery, sortConfig, kelengkapanMap]);

  const SortableHeader = ({ label, sortKey, className = "" }) => (
    <div 
      className={`flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors select-none ${className}`}
      onClick={() => toggleSort(sortKey)}
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortConfig.key === sortKey ? 'text-primary' : 'text-muted-foreground/50'}`} />
    </div>
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Selesai': return <Badge className="bg-success text-success-foreground hover:bg-success/90">Selesai</Badge>;
      case 'Proses': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Proses</Badge>;
      case 'Pending': return <Badge variant="outline" className="text-warning border-warning bg-warning/10">Pending</Badge>;
      case 'Diambil': return <Badge variant="secondary">Diambil</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Jasa Service - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-secondary/20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Jasa Service</h1>
                  <p className="text-muted-foreground mt-1">Kelola perbaikan dan reparasi barang pelanggan</p>
                </div>
                <Card className="w-full md:w-auto shadow-sm border-none bg-card">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-success/10 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Telah Selesai</p>
                      <p className="text-2xl font-bold font-mono">{totalSelesai}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-card border-b px-6 py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle>Daftar Pengerjaan</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari no, nama, kelengkapan..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 bg-background"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-background">
                          <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Proses">Proses</SelectItem>
                          <SelectItem value="Selesai">Selesai</SelectItem>
                          <SelectItem value="Diambil">Diambil</SelectItem>
                        </SelectContent>
                      </Select>
                      {canEdit && (
                        <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="shadow-sm">
                          <Plus className="w-4 h-4 mr-2" /> Tambah Service
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-card">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-[60px] text-center">Foto</TableHead>
                            <TableHead><SortableHeader label="No. Service" sortKey="nomor_service" /></TableHead>
                            <TableHead><SortableHeader label="Pelanggan" sortKey="customer_name" /></TableHead>
                            <TableHead><SortableHeader label="Barang" sortKey="barang_service" /></TableHead>
                            <TableHead><SortableHeader label="Teknisi" sortKey="teknisi" /></TableHead>
                            <TableHead><SortableHeader label="Status" sortKey="status" /></TableHead>
                            <TableHead><SortableHeader label="Kelengkapan" sortKey="kelengkapan_str" /></TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedServices.map(item => {
                            const kelengkapanNames = getKelengkapanNames(item);
                            const displayKelengkapan = kelengkapanNames.slice(0, 3).join(', ') + (kelengkapanNames.length > 3 ? '...' : '');
                            
                            return (
                              <TableRow 
                                key={item.id} 
                                className="hover:bg-muted/40 group transition-colors cursor-pointer"
                                onClick={() => setViewDetailItem(item)}
                              >
                                <TableCell className="text-center">
                                  {item.foto_barang && item.foto_barang.length > 0 ? (
                                    <div className="relative inline-block">
                                      <div className="w-10 h-10 rounded-lg overflow-hidden border bg-background">
                                        <img 
                                          src={pb.files.getUrl(item, item.foto_barang[0], { thumb: '50x50f' })} 
                                          alt="Thumbnail" 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      {item.foto_barang.length > 1 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-card shadow-sm">
                                          +{item.foto_barang.length - 1}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center border mx-auto">
                                      <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium font-mono text-muted-foreground">{item.nomor_service}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{item.customer_name}</span>
                                    <span className="text-xs text-muted-foreground">{item.nomor_hp}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[150px] truncate font-medium text-foreground" title={item.barang_service}>
                                    {item.barang_service}
                                  </div>
                                </TableCell>
                                <TableCell>{item.teknisi || '-'}</TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                <TableCell>
                                  <div className="max-w-[150px] truncate text-sm text-muted-foreground" title={kelengkapanNames.join(', ')}>
                                    {displayKelengkapan || '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => { e.stopPropagation(); setViewDetailItem(item); }}
                                      title="Lihat Detail"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {canEdit && (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => handleEdit(item, e)}
                                          title="Edit"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="destructive" 
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {filteredAndSortedServices.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                    <Wrench className="w-6 h-6 opacity-40" />
                                  </div>
                                  <p className="font-medium text-foreground">Tidak ada data service</p>
                                  <p className="text-sm mt-1">Belum ada service yang sesuai dengan pencarian/filter Anda.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        <Footer />
      </div>

      {canEdit && (
        <ServiceForm
          open={showForm}
          onClose={() => setShowForm(false)}
          service={editingItem}
          onSuccess={loadServices}
        />
      )}

      <Dialog open={!!viewDetailItem} onOpenChange={() => setViewDetailItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0 bg-card flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-muted/10">
            <div className="flex justify-between items-start pr-6">
              <div>
                <DialogTitle className="text-xl flex items-center gap-3">
                  Detail Jasa Service
                  {viewDetailItem && getStatusBadge(viewDetailItem.status)}
                </DialogTitle>
                <DialogDescription className="mt-1 font-mono text-muted-foreground">
                  {viewDetailItem?.nomor_service}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewDetailItem && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Informasi Umum</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Tanggal Masuk</span>
                        <p className="font-medium">{new Date(viewDetailItem.tanggal).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Teknisi</span>
                        <p className="font-medium">{viewDetailItem.teknisi || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Pelanggan</span>
                        <p className="font-medium">{viewDetailItem.customer_name}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Kontak</span>
                        <p className="font-medium">{viewDetailItem.nomor_hp}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Data Perangkat</h3>
                    <div className="bg-muted/30 p-4 rounded-xl space-y-4 border">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Barang</span>
                        <p className="font-medium text-foreground">{viewDetailItem.barang_service}</p>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Keluhan</span>
                        <p className="text-foreground whitespace-pre-wrap">{viewDetailItem.keluhan || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Kelengkapan Barang</h3>
                    <AccessoriesDisplay items={getKelengkapanNames(viewDetailItem)} />
                  </div>
                  
                  {viewDetailItem.biaya_service > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Estimasi / Biaya</h3>
                      <p className="text-2xl font-bold font-mono text-primary">Rp {viewDetailItem.biaya_service.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-muted/10 p-6 rounded-2xl border">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" /> 
                    Dokumentasi Foto
                    <Badge variant="secondary" className="ml-auto">{viewDetailItem.foto_barang?.length || 0} Foto</Badge>
                  </h3>
                  
                  <ServicePhotoGallery 
                    photos={viewDetailItem.foto_barang} 
                    record={viewDetailItem} 
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 border-t bg-card shrink-0 flex justify-end">
            <Button variant="outline" onClick={() => setViewDetailItem(null)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Service</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data service ini? Seluruh data kelengkapan dan foto akan terhapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus Permanen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default JasaServicePage;

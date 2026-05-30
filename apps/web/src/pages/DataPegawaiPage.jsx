import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import FormPegawaiModal from '@/components/FormPegawaiModal.jsx';
import { exportToPDF, exportToExcel } from '@/lib/PegawaiExportHelper.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, FilterX, Edit, Trash2, Eye, Download, FileText, ArrowUpDown, Users, Copy } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DataPegawaiPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState('-created');
  
  const [search, setSearch] = useState('');
  const [filterPosisi, setFilterPosisi] = useState('all');
  const [filterDepartemen, setFilterDepartemen] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, perPage, sortField, filterPosisi, filterDepartemen, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let filterQuery = [];
      if (search) filterQuery.push(`(nama_lengkap ~ "${search}" || email ~ "${search}" || id_pegawai ~ "${search}")`);
      if (filterPosisi !== 'all') filterQuery.push(`posisi = "${filterPosisi}"`);
      if (filterDepartemen !== 'all') filterQuery.push(`departemen = "${filterDepartemen}"`);
      if (filterStatus !== 'all') filterQuery.push(`status_kerja = "${filterStatus}"`);

      const records = await pb.collection('pegawai').getList(page, perPage, {
        filter: filterQuery.join(' && '),
        sort: sortField,
        $autoCancel: false
      });

      setData(records.items);
      setTotalItems(records.totalItems);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data pegawai');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterPosisi('all');
    setFilterDepartemen('all');
    setFilterStatus('all');
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortField(`-${field}`);
    } else {
      setSortField(field);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('ID Pegawai disalin ke clipboard');
  };

  const handleDelete = async () => {
    try {
      if (itemToDelete) {
        await pb.collection('pegawai').delete(itemToDelete, { $autoCancel: false });
        toast.success('Data pegawai berhasil dihapus');
      } else if (selectedIds.length > 0) {
        await Promise.all(selectedIds.map(id => pb.collection('pegawai').delete(id, { $autoCancel: false })));
        toast.success(`${selectedIds.length} data pegawai berhasil dihapus`);
        setSelectedIds([]);
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus data');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      let filterQuery = [];
      if (search) filterQuery.push(`(nama_lengkap ~ "${search}" || email ~ "${search}" || id_pegawai ~ "${search}")`);
      if (filterPosisi !== 'all') filterQuery.push(`posisi = "${filterPosisi}"`);
      if (filterDepartemen !== 'all') filterQuery.push(`departemen = "${filterDepartemen}"`);
      if (filterStatus !== 'all') filterQuery.push(`status_kerja = "${filterStatus}"`);

      const records = await pb.collection('pegawai').getFullList({
        filter: filterQuery.join(' && '),
        sort: sortField,
        $autoCancel: false
      });
      
      await exportToPDF(records);
      toast.success('Berhasil export ke PDF');
    } catch (error) {
      toast.error('Gagal export ke PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      let filterQuery = [];
      if (search) filterQuery.push(`(nama_lengkap ~ "${search}" || email ~ "${search}" || id_pegawai ~ "${search}")`);
      if (filterPosisi !== 'all') filterQuery.push(`posisi = "${filterPosisi}"`);
      if (filterDepartemen !== 'all') filterQuery.push(`departemen = "${filterDepartemen}"`);
      if (filterStatus !== 'all') filterQuery.push(`status_kerja = "${filterStatus}"`);

      const records = await pb.collection('pegawai').getFullList({
        filter: filterQuery.join(' && '),
        sort: sortField,
        $autoCancel: false
      });
      
      exportToExcel(records);
      toast.success('Berhasil export ke Excel');
    } catch (error) {
      toast.error('Gagal export ke Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) setSelectedIds([]);
    else setSelectedIds(data.map(item => item.id));
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Aktif': return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] md:text-xs">Aktif</Badge>;
      case 'Cuti': return <Badge variant="outline" className="text-amber-500 border-amber-500 text-[10px] md:text-xs">Cuti</Badge>;
      case 'Resign': return <Badge variant="destructive" className="text-[10px] md:text-xs">Resign</Badge>;
      case 'Kontrak Berakhir': return <Badge variant="secondary" className="text-[10px] md:text-xs">Berakhir</Badge>;
      default: return <Badge className="text-[10px] md:text-xs">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Data Pegawai - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Data Pegawai</h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">Kelola seluruh data karyawan dalam satu tempat.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={handleExportPDF} disabled={isExporting} className="flex-1 sm:flex-none h-10 touch-target">
                    <FileText className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">PDF</span>
                  </Button>
                  <Button variant="outline" onClick={handleExportExcel} disabled={isExporting} className="flex-1 sm:flex-none h-10 touch-target">
                    <Download className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Excel</span>
                  </Button>
                  <Button onClick={() => { setEditingData(null); setIsModalOpen(true); }} className="w-full sm:w-auto h-10 touch-target">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Pegawai
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4">
                  <div className="sm:col-span-2 lg:col-span-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari ID, nama, email..." 
                      className="pl-9 h-10 touch-target text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Select value={filterPosisi} onValueChange={setFilterPosisi}>
                      <SelectTrigger className="h-10 touch-target text-sm"><SelectValue placeholder="Posisi" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Posisi</SelectItem>
                        <SelectItem value="Kasir">Kasir</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-2">
                    <Select value={filterDepartemen} onValueChange={setFilterDepartemen}>
                      <SelectTrigger className="h-10 touch-target text-sm"><SelectValue placeholder="Departemen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Dept</SelectItem>
                        <SelectItem value="Penjualan">Penjualan</SelectItem>
                        <SelectItem value="Operasional">Operasional</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-10 touch-target text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Cuti">Cuti</SelectItem>
                        <SelectItem value="Resign">Resign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-2">
                    <Button variant="ghost" className="w-full h-10 touch-target text-muted-foreground text-sm" onClick={clearFilters}>
                      <FilterX className="w-4 h-4 mr-2" /> Reset
                    </Button>
                  </div>
                </div>

                {selectedIds.length > 0 && (
                  <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg flex justify-between items-center animate-in fade-in zoom-in">
                    <span className="text-sm font-medium">{selectedIds.length} item dipilih</span>
                    <Button variant="destructive" size="sm" onClick={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }} className="h-9 touch-target">
                      <Trash2 className="w-4 h-4 mr-2" /> Hapus
                    </Button>
                  </div>
                )}

                <div className="border border-border rounded-lg overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[40px] text-center p-2 md:p-4">
                          <Checkbox checked={selectedIds.length > 0 && selectedIds.length === data.length} onCheckedChange={toggleSelectAll} className="touch-target" />
                        </TableHead>
                        <TableHead className="p-2 md:p-4 text-xs md:text-sm">Profil</TableHead>
                        <TableHead className="cursor-pointer hover:text-foreground p-2 md:p-4 text-xs md:text-sm" onClick={() => handleSort('id_pegawai')}>
                          ID Pegawai <ArrowUpDown className="inline w-3 h-3 ml-1" />
                        </TableHead>
                        <TableHead className="cursor-pointer hover:text-foreground p-2 md:p-4 text-xs md:text-sm" onClick={() => handleSort('nama_lengkap')}>
                          Nama <ArrowUpDown className="inline w-3 h-3 ml-1" />
                        </TableHead>
                        <TableHead className="p-2 md:p-4 text-xs md:text-sm">Posisi</TableHead>
                        <TableHead className="p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">Departemen</TableHead>
                        <TableHead className="p-2 md:p-4 text-xs md:text-sm">Status</TableHead>
                        <TableHead className="text-right p-2 md:p-4 text-xs md:text-sm">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="p-2 md:p-4"><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell className="p-2 md:p-4"><Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" /></TableCell>
                            <TableCell className="p-2 md:p-4"><Skeleton className="h-5 w-[80px]" /></TableCell>
                            <TableCell className="p-2 md:p-4"><Skeleton className="h-4 w-[120px] mb-1" /><Skeleton className="h-3 w-[90px]" /></TableCell>
                            <TableCell className="p-2 md:p-4"><Skeleton className="h-4 w-[70px]" /></TableCell>
                            <TableCell className="p-2 md:p-4 hidden md:table-cell"><Skeleton className="h-4 w-[90px]" /></TableCell>
                            <TableCell className="p-2 md:p-4"><Skeleton className="h-5 w-[50px] rounded-full" /></TableCell>
                            <TableCell className="p-2 md:p-4"><Skeleton className="h-8 w-[80px] ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center">
                              <Users className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-20" />
                              <p className="font-medium text-foreground text-sm md:text-base">Tidak ada data ditemukan</p>
                              <p className="text-xs md:text-sm">Coba sesuaikan filter atau pencarian Anda.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((item) => (
                          <TableRow key={item.id} className="group">
                            <TableCell className="text-center p-2 md:p-4">
                              <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} className="touch-target" />
                            </TableCell>
                            <TableCell className="p-2 md:p-4">
                              <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-border">
                                <AvatarImage src={item.foto_profil ? pb.files.getUrl(item, item.foto_profil) : null} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">{item.nama_lengkap.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="p-2 md:p-4">
                              <div className="flex items-center">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 font-mono tracking-widest shadow-sm text-[10px] md:text-xs">
                                  {item.id_pegawai || 'N/A'}
                                </Badge>
                                {item.id_pegawai && (
                                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-muted-foreground hover:text-primary touch-target" onClick={() => copyToClipboard(item.id_pegawai)}>
                                    <Copy className="h-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="p-2 md:p-4">
                              <div className="font-medium text-foreground text-xs md:text-sm">{item.nama_lengkap}</div>
                              <div className="text-[10px] md:text-xs text-muted-foreground truncate max-w-[120px] md:max-w-[200px]">{item.email}</div>
                            </TableCell>
                            <TableCell className="p-2 md:p-4 text-xs md:text-sm">{item.posisi}</TableCell>
                            <TableCell className="p-2 md:p-4 text-xs md:text-sm hidden md:table-cell">{item.departemen}</TableCell>
                            <TableCell className="p-2 md:p-4">{getStatusBadge(item.status_kerja)}</TableCell>
                            <TableCell className="text-right p-2 md:p-4">
                              <div className="flex justify-end gap-1 md:gap-2">
                                <Link to={`/pegawai/${item.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-primary touch-target">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-blue-500 touch-target"
                                  onClick={() => { setEditingData(item); setIsModalOpen(true); }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-destructive touch-target"
                                  onClick={() => { setItemToDelete(item.id); setIsDeleteModalOpen(true); }}
                                >
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

                {!loading && data.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                      <span className="text-xs md:text-sm text-muted-foreground">Tampil</span>
                      <Select value={perPage.toString()} onValueChange={v => setPerPage(Number(v))}>
                        <SelectTrigger className="h-8 w-[70px] text-xs md:text-sm touch-target"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-xs md:text-sm text-muted-foreground">dari {totalItems}</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-9 touch-target text-xs md:text-sm">Prev</Button>
                      <Button variant="outline" size="sm" disabled={page >= Math.ceil(totalItems / perPage)} onClick={() => setPage(page + 1)} className="h-9 touch-target text-xs md:text-sm">Next</Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
        <Footer />
      </div>

      <FormPegawaiModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        initialData={editingData}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="w-[90vw] max-w-md rounded-xl p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto h-10 md:h-11 touch-target">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto h-10 md:h-11 touch-target">Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataPegawaiPage;
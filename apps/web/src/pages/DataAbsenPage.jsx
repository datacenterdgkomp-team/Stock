
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, ChevronLeft, ChevronRight, ArrowUpDown, FilterX, Eye } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const DataAbsenPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [pegawaiMap, setPegawaiMap] = useState({});
  const [pegawaiList, setPegawaiList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('-tanggal');
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    pegawaiId: 'all',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const list = await pb.collection('pegawai').getFullList({ sort: 'nama_lengkap', $autoCancel: false });
        setPegawaiList(list);
        const map = {};
        list.forEach(p => {
          map[p.nama_lengkap] = p.id_pegawai;
        });
        setPegawaiMap(map);
      } catch (err) {
        console.error('Failed to load pegawai list', err);
      }
    };
    fetchPegawai();
  }, []);

  useEffect(() => {
    if (pegawaiList.length > 0 || Object.keys(pegawaiMap).length > 0) {
      loadData();
    } else {
      loadData();
    }
  }, [page, filters, sortField, pegawaiList]);

  const loadData = async () => {
    setLoading(true);
    try {
      let filterQuery = [];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchedPegawaiIds = pegawaiList
          .filter(p => (p.id_pegawai && p.id_pegawai.toLowerCase().includes(searchLower)) || 
                       (p.nama_lengkap && p.nama_lengkap.toLowerCase().includes(searchLower)))
          .map(p => p.nama_lengkap);

        if (matchedPegawaiIds.length > 0) {
          const nameFilters = matchedPegawaiIds.map(name => `nama_pegawai = "${name}"`).join(' || ');
          filterQuery.push(`(${nameFilters} || nama_pegawai ~ "${filters.search}")`);
        } else {
          filterQuery.push(`nama_pegawai ~ "${filters.search}"`);
        }
      }

      if (filters.pegawaiId !== 'all') {
        const selectedPegawai = pegawaiList.find(p => p.id_pegawai === filters.pegawaiId);
        if (selectedPegawai) {
          filterQuery.push(`nama_pegawai = "${selectedPegawai.nama_lengkap}"`);
        }
      }

      if (filters.status !== 'all') {
        filterQuery.push(`status = "${filters.status}"`);
      }
      
      if (filters.date) {
        const startOfDay = `${filters.date} 00:00:00.000Z`;
        const endOfDay = `${filters.date} 23:59:59.999Z`;
        filterQuery.push(`tanggal >= "${startOfDay}" && tanggal <= "${endOfDay}"`);
      }

      const options = {
        sort: sortField,
        $autoCancel: false
      };
      
      if (filterQuery.length > 0) {
        options.filter = filterQuery.join(' && ');
      }

      const res = await pb.collection('absen_pegawai').getList(page, 20, options);
      setRecords(res.items);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const actualField = field === 'id_pegawai' ? 'nama_pegawai' : field;
    if (sortField === actualField) {
      setSortField(`-${actualField}`);
    } else {
      setSortField(actualField);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      pegawaiId: 'all',
      date: ''
    });
    setPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hadir': return <Badge className="bg-[hsl(var(--status-hadir))] text-white hover:bg-[hsl(var(--status-hadir))]">Hadir</Badge>;
      case 'Izin': return <Badge className="bg-[hsl(var(--status-izin))] text-white hover:bg-[hsl(var(--status-izin))]">Izin</Badge>;
      case 'Sakit': return <Badge className="bg-[hsl(var(--status-sakit))] text-white hover:bg-[hsl(var(--status-sakit))]">Sakit</Badge>;
      case 'Terlambat': return <Badge className="bg-[hsl(var(--status-terlambat))] text-white hover:bg-[hsl(var(--status-terlambat))]">Terlambat</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Data Absen - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Data Absensi Pegawai</h1>
                <p className="text-muted-foreground mt-1">Kelola dan pantau kehadiran pegawai setiap hari.</p>
              </div>

              <Card className="shadow-sm border-none bg-card">
                <CardHeader className="pb-4 border-b border-border bg-muted/20">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <CardTitle className="text-lg">Filter Data</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full lg:w-auto items-center">
                      <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Cari ID atau nama..." 
                          className="pl-9 bg-background"
                          value={filters.search}
                          onChange={(e) => {
                            setFilters({...filters, search: e.target.value});
                            setPage(1);
                          }}
                        />
                      </div>
                      
                      <Select value={filters.pegawaiId} onValueChange={(v) => { setFilters({...filters, pegawaiId: v}); setPage(1); }}>
                        <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Pilih Pegawai" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Pegawai</SelectItem>
                          {pegawaiList.map(p => (
                            <SelectItem key={p.id} value={p.id_pegawai}>{p.id_pegawai} - {p.nama_lengkap}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filters.status} onValueChange={(v) => { setFilters({...filters, status: v}); setPage(1); }}>
                        <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="Hadir">Hadir</SelectItem>
                          <SelectItem value="Izin">Izin</SelectItem>
                          <SelectItem value="Sakit">Sakit</SelectItem>
                          <SelectItem value="Terlambat">Terlambat</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input 
                        type="date" 
                        className="w-full bg-background"
                        value={filters.date}
                        onChange={(e) => { setFilters({...filters, date: e.target.value}); setPage(1); }}
                      />
                      
                      <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                        <FilterX className="w-4 h-4 mr-2" /> Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('tanggal')}>
                            Tanggal <ArrowUpDown className="inline w-3 h-3 ml-1" />
                          </TableHead>
                          <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('id_pegawai')}>
                            ID Pegawai <ArrowUpDown className="inline w-3 h-3 ml-1" />
                          </TableHead>
                          <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('nama_pegawai')}>
                            Nama Pegawai <ArrowUpDown className="inline w-3 h-3 ml-1" />
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Jam Masuk</TableHead>
                          <TableHead className="text-center">Jam Keluar</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={8} className="text-center py-12">Loading data absensi...</TableCell></TableRow>
                        ) : records.length === 0 ? (
                          <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Tidak ada data absensi ditemukan untuk filter ini.</TableCell></TableRow>
                        ) : (
                          records.map(record => (
                            <TableRow 
                              key={record.id} 
                              className="table-row-striped cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => navigate(`/detail-absen/${record.id}`)}
                            >
                              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                {new Date(record.tanggal).toLocaleDateString('id-ID')}
                              </TableCell>
                              <TableCell>
                                {pegawaiMap[record.nama_pegawai] ? (
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 font-mono tracking-widest shadow-sm">
                                    {pegawaiMap[record.nama_pegawai]}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs italic">N/A</span>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{record.nama_pegawai}</TableCell>
                              <TableCell>{getStatusBadge(record.status)}</TableCell>
                              <TableCell className="text-center font-mono text-sm">{record.jam_masuk || '-'}</TableCell>
                              <TableCell className="text-center font-mono text-sm">{record.jam_keluar || '-'}</TableCell>
                              <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground" title={record.keterangan || '-'}>
                                {record.keterangan || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/detail-absen/${record.id}`);
                                  }}
                                  className="h-8 shadow-sm"
                                >
                                  <Eye className="w-4 h-4 mr-1.5" /> Detail
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                      <span className="text-sm text-muted-foreground font-medium">Halaman {page} dari {totalPages}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                          Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default DataAbsenPage;

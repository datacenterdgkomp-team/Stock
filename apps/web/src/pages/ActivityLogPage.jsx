
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ActivityLogStats from '@/components/ActivityLogStats.jsx';
import ActivityLogExport from '@/components/ActivityLogExport.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Search, FilterX, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [settings, setSettings] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    modul: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [allLogsForExport, setAllLogsForExport] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadSettings = async () => {
    try {
      const records = await pb.collection('pengaturan_toko').getFullList({ $autoCancel: false });
      if (records.length > 0) setSettings(records[0]);
    } catch (e) {}
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      let filterQuery = [];
      
      if (filters.search) {
        filterQuery.push(`(username ~ "${filters.search}" || deskripsi ~ "${filters.search}")`);
      }
      if (filters.modul !== 'all') {
        filterQuery.push(`modul = "${filters.modul}"`);
      }
      if (filters.status !== 'all') {
        filterQuery.push(`status = "${filters.status}"`);
      }
      if (filters.startDate) {
        filterQuery.push(`timestamp >= "${filters.startDate} 00:00:00.000Z"`);
      }
      if (filters.endDate) {
        const nextDay = new Date(filters.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        filterQuery.push(`timestamp < "${nextDay.toISOString().split('T')[0]} 00:00:00.000Z"`);
      }

      const options = {
        sort: '-timestamp',
        $autoCancel: false
      };
      
      if (filterQuery.length > 0) {
        options.filter = filterQuery.join(' && ');
      }

      const records = await pb.collection('activity_log').getList(page, 50, options);
      setLogs(records.items);
      setTotalPages(records.totalPages);

      // Fetch all for export (limit to 1000 to avoid crash)
      const exportData = await pb.collection('activity_log').getList(1, 1000, options);
      setAllLogsForExport(exportData.items);

    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat histori pengguna');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      modul: 'all',
      status: 'all',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };

  const getStatusBadge = (status) => {
    if (status === 'Sukses') return <Badge className="bg-[hsl(var(--success))] text-white">Sukses</Badge>;
    return <Badge variant="destructive">Gagal</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>Histori Pengguna - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Histori Pengguna</h1>
                  <p className="text-muted-foreground mt-1">Pantau aktivitas pengguna dalam sistem.</p>
                </div>
                <ActivityLogExport data={allLogsForExport} settings={settings} />
              </div>

              <ActivityLogStats />

              <Card className="shadow-sm border-none bg-card">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-2 relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cari pengguna atau deskripsi..." 
                        className="pl-9"
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                      />
                    </div>
                    <Select value={filters.modul} onValueChange={(v) => setFilters({...filters, modul: v})}>
                      <SelectTrigger><SelectValue placeholder="Modul" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Modul</SelectItem>
                        <SelectItem value="Kasir">Kasir</SelectItem>
                        <SelectItem value="Manajemen Barang">Manajemen Barang</SelectItem>
                        <SelectItem value="Jasa Service">Jasa Service</SelectItem>
                        <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                        <SelectItem value="User Management">User Management</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                      <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Sukses">Sukses</SelectItem>
                        <SelectItem value="Gagal">Gagal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      type="date" 
                      value={filters.startDate}
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    />
                    <div className="flex gap-2">
                      <Input 
                        type="date" 
                        value={filters.endDate}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      />
                      <Button variant="outline" size="icon" onClick={resetFilters} title="Reset Filter">
                        <FilterX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Pengguna</TableHead>
                          <TableHead>Modul</TableHead>
                          <TableHead>Tipe Aktivitas</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : logs.length === 0 ? (
                          <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada histori ditemukan.</TableCell></TableRow>
                        ) : (
                          logs.map(log => (
                            <TableRow key={log.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedLog(log)}>
                              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell className="font-medium">{log.username}</TableCell>
                              <TableCell>{log.modul}</TableCell>
                              <TableCell>{log.tipe_aktivitas}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{log.deskripsi}</TableCell>
                              <TableCell>{getStatusBadge(log.status)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <span className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</span>
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

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Aktivitas</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Waktu</span>
                <span className="col-span-2 font-medium">{new Date(selectedLog.timestamp).toLocaleString('id-ID')}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Pengguna</span>
                <span className="col-span-2 font-medium">{selectedLog.username}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Modul / Tipe</span>
                <span className="col-span-2 font-medium">{selectedLog.modul} / {selectedLog.tipe_aktivitas}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2">{getStatusBadge(selectedLog.status)}</span>
              </div>
              <div className="grid grid-cols-3 border-b pb-2">
                <span className="text-muted-foreground">IP Address</span>
                <span className="col-span-2 font-mono text-xs bg-muted p-1 rounded">{selectedLog.ip_address || '-'}</span>
              </div>
              <div className="grid grid-cols-3 pb-2">
                <span className="text-muted-foreground">User Agent</span>
                <span className="col-span-2 text-xs text-muted-foreground break-words">{selectedLog.user_agent || '-'}</span>
              </div>
              <div className="mt-4 bg-muted p-3 rounded-lg">
                <p className="font-medium mb-1">Deskripsi:</p>
                <p>{selectedLog.deskripsi}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivityLogPage;

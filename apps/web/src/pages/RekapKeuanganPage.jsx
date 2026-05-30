
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import FilterPanel from '@/components/FilterPanel.jsx';
import SummaryCard from '@/components/SummaryCard.jsx';
import ExportPDF from '@/components/ExportPDF.jsx';
import ExportExcel from '@/components/ExportExcel.jsx';
import { 
  BarChartPemasukanPengeluaran, 
  PieChartPengeluaran, 
  LineChartTrend 
} from '@/components/ChartComponents.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, Wallet, TrendingUp, ShoppingCart, Receipt } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { logActivity } from '@/lib/ActivityLogHelper.js';
import { toast } from 'sonner';

const RekapKeuanganPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeFilters, setActiveFilters] = useState({ metode: 'all', kategori: 'all' });
  const [storeSettings, setStoreSettings] = useState(null);

  const [data, setData] = useState({
    pemasukan: [],
    pengeluaran: [],
    summary: {
      totalPemasukan: 0,
      totalPengeluaran: 0,
      labaBersih: 0,
      jumlahTransaksi: 0,
      jumlahPengeluaran: 0
    },
    charts: {
      barData: [],
      pieData: [],
      trendData: []
    }
  });

  useEffect(() => {
    loadSettings();
    loadData();
  }, []);

  const loadSettings = async () => {
    try {
      const records = await pb.collection('pengaturan_toko').getFullList({ $autoCancel: false });
      if (records.length > 0) setStoreSettings(records[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async (filters = null) => {
    setLoading(true);
    try {
      const currentStart = filters?.startDate || dateRange.startDate;
      const currentEnd = filters?.endDate || dateRange.endDate;
      const currentMetode = filters?.metode || activeFilters.metode;
      const currentKategori = filters?.kategori || activeFilters.kategori;

      const startDateTime = `${currentStart} 00:00:00.000Z`;
      const endDateObj = new Date(currentEnd);
      endDateObj.setDate(endDateObj.getDate() + 1);
      const endDateTime = `${endDateObj.toISOString().split('T')[0]} 00:00:00.000Z`;

      let pemFilter = `tanggal >= "${startDateTime}" && tanggal < "${endDateTime}"`;
      if (currentMetode !== 'all') pemFilter += ` && metode_pembayaran = "${currentMetode}"`;
      
      const pemasukanRecords = await pb.collection('transaksi_penjualan').getFullList({
        filter: pemFilter,
        sort: '-tanggal',
        expand: 'kasir',
        $autoCancel: false
      });

      let pengFilter = `tanggal >= "${startDateTime}" && tanggal < "${endDateTime}"`;
      if (currentKategori !== 'all') pengFilter += ` && kategori_pengeluaran = "${currentKategori}"`;

      const pengeluaranRecords = await pb.collection('pengeluaran_harian').getFullList({
        filter: pengFilter,
        sort: '-tanggal',
        $autoCancel: false
      });

      const totalPemasukan = pemasukanRecords.reduce((sum, item) => sum + (item.total || 0), 0);
      const totalPengeluaran = pengeluaranRecords.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      const labaBersih = totalPemasukan - totalPengeluaran;

      const dateMap = {};
      let loopDate = new Date(currentStart);
      const endLoop = new Date(currentEnd);
      while(loopDate <= endLoop) {
        const dStr = loopDate.toISOString().split('T')[0];
        dateMap[dStr] = { date: new Date(dStr).toLocaleDateString('id-ID', {day:'numeric', month:'short'}), rawDate: dStr, pemasukan: 0, pengeluaran: 0 };
        loopDate.setDate(loopDate.getDate() + 1);
      }

      pemasukanRecords.forEach(p => {
        const dStr = p.tanggal.split(' ')[0];
        if(dateMap[dStr]) dateMap[dStr].pemasukan += p.total;
      });

      pengeluaranRecords.forEach(p => {
        const dStr = p.tanggal.split(' ')[0];
        if(dateMap[dStr]) dateMap[dStr].pengeluaran += p.jumlah;
      });

      const barData = Object.values(dateMap).sort((a,b) => a.rawDate.localeCompare(b.rawDate));
      const trendData = barData.map(d => ({ date: d.date, total: d.pemasukan }));

      const pieMap = {};
      pengeluaranRecords.forEach(p => {
        const cat = p.kategori_pengeluaran || 'Lainnya';
        pieMap[cat] = (pieMap[cat] || 0) + p.jumlah;
      });
      const pieData = Object.keys(pieMap).map(name => ({ name, value: pieMap[name] }));

      setData({
        pemasukan: pemasukanRecords,
        pengeluaran: pengeluaranRecords,
        summary: {
          totalPemasukan,
          totalPengeluaran,
          labaBersih,
          jumlahTransaksi: pemasukanRecords.length,
          jumlahPengeluaran: pengeluaranRecords.length
        },
        charts: { barData, pieData, trendData }
      });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    setDateRange({ startDate: filters.startDate, endDate: filters.endDate });
    setActiveFilters({ metode: filters.metode, kategori: filters.kategori });
    loadData(filters);
  };

  const wrapExportWithLog = (exportComponent, type) => {
    return React.cloneElement(exportComponent, {
      onClickWrapper: async () => {
        await logActivity(`Export ${type}`, 'Rekap Keuangan', `Mengekspor laporan keuangan dalam format ${type}`, 'Sukses');
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Rekap Keuangan - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Rekap Keuangan</h1>
                  <p className="text-muted-foreground mt-1">Dashboard ringkasan finansial dan analisis toko.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div onClick={() => logActivity('Export PDF', 'Rekap Keuangan', 'Mengekspor laporan keuangan PDF')}>
                    <ExportPDF data={data} dateRange={dateRange} settings={storeSettings} />
                  </div>
                  <div onClick={() => logActivity('Export Excel', 'Rekap Keuangan', 'Mengekspor laporan keuangan Excel')}>
                    <ExportExcel data={data} dateRange={dateRange} />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => loadData()}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              <FilterPanel onApplyFilters={handleApplyFilters} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard title="Total Pemasukan" value={`Rp ${data.summary.totalPemasukan.toLocaleString('id-ID')}`} icon={DollarSign} variant="primary" loading={loading} />
                <SummaryCard title="Total Pengeluaran" value={`Rp ${data.summary.totalPengeluaran.toLocaleString('id-ID')}`} icon={Receipt} variant="danger" loading={loading} />
                <SummaryCard title="Laba Bersih" value={`Rp ${data.summary.labaBersih.toLocaleString('id-ID')}`} icon={Wallet} variant="success" loading={loading} />
                <SummaryCard title="Jumlah Transaksi" value={data.summary.jumlahTransaksi.toLocaleString('id-ID')} icon={ShoppingCart} loading={loading} />
                <SummaryCard title="Item Pengeluaran" value={data.summary.jumlahPengeluaran.toLocaleString('id-ID')} icon={TrendingUp} loading={loading} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm border-none bg-card">
                  <CardHeader><CardTitle className="text-lg">Pemasukan vs Pengeluaran per Hari</CardTitle></CardHeader>
                  <CardContent>{loading ? <div className="h-64 animate-pulse bg-muted rounded-lg"></div> : <BarChartPemasukanPengeluaran data={data.charts.barData} />}</CardContent>
                </Card>
                
                <Card className="shadow-sm border-none bg-card">
                  <CardHeader><CardTitle className="text-lg">Komposisi Pengeluaran</CardTitle></CardHeader>
                  <CardContent>{loading ? <div className="h-64 animate-pulse bg-muted rounded-lg"></div> : <PieChartPengeluaran data={data.charts.pieData} />}</CardContent>
                </Card>

                <Card className="lg:col-span-3 shadow-sm border-none bg-card">
                  <CardHeader><CardTitle className="text-lg">Trend Pemasukan</CardTitle></CardHeader>
                  <CardContent>{loading ? <div className="h-64 animate-pulse bg-muted rounded-lg"></div> : <LineChartTrend data={data.charts.trendData} />}</CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-none bg-card flex flex-col">
                  <CardHeader className="border-b border-border bg-muted/20 pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-primary" /> Detail Pemasukan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <div className="max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>No. Transaksi</TableHead>
                            <TableHead>Metode</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                          ) : data.pemasukan.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada data pemasukan</TableCell></TableRow>
                          ) : (
                            data.pemasukan.map(item => (
                              <TableRow key={item.id} className="table-row-striped">
                                <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                                <TableCell className="font-medium text-primary">{item.nomor_transaksi}</TableCell>
                                <TableCell>{item.metode_pembayaran}</TableCell>
                                <TableCell className="text-right font-medium">Rp {item.total.toLocaleString('id-ID')}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-card flex flex-col">
                  <CardHeader className="border-b border-border bg-muted/20 pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-destructive" /> Detail Pengeluaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <div className="max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                          ) : data.pengeluaran.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada data pengeluaran</TableCell></TableRow>
                          ) : (
                            data.pengeluaran.map(item => (
                              <TableRow key={item.id} className="table-row-striped">
                                <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                                <TableCell>{item.kategori_pengeluaran}</TableCell>
                                <TableCell className="truncate max-w-[150px]">{item.deskripsi}</TableCell>
                                <TableCell className="text-right font-medium text-destructive">Rp {item.jumlah.toLocaleString('id-ID')}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default RekapKeuanganPage;

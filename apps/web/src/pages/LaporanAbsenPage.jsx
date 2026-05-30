
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileText, FileSpreadsheet, Users, CheckCircle, AlertTriangle, UserX, Clock, ArrowUpDown } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { logActivity } from '@/lib/ActivityLogHelper.js';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const LaporanAbsenPage = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);
  
  const currentDate = new Date();
  const [filters, setFilters] = useState({
    month: (currentDate.getMonth() + 1).toString().padStart(2, '0'),
    year: currentDate.getFullYear().toString(),
    pegawaiId: 'all'
  });

  const [sortField, setSortField] = useState('id_pegawai');
  const [sortDirection, setSortDirection] = useState('asc');

  const [stats, setStats] = useState({
    totalHadir: 0,
    totalIzin: 0,
    totalSakit: 0,
    totalTerlambat: 0,
    persentase: 0
  });

  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [rawRecords, setRawRecords] = useState([]);
  const [pegawaiMap, setPegawaiMap] = useState({});
  const [pegawaiList, setPegawaiList] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [filters, sortField, sortDirection]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const pList = await pb.collection('pegawai').getFullList({ sort: 'nama_lengkap', $autoCancel: false });
      setPegawaiList(pList);
      
      const pMap = {};
      pList.forEach(p => pMap[p.nama_lengkap] = p.id_pegawai);
      setPegawaiMap(pMap);

      const startDate = `${filters.year}-${filters.month}-01 00:00:00.000Z`;
      const nextMonth = parseInt(filters.month) === 12 ? 1 : parseInt(filters.month) + 1;
      const nextYear = parseInt(filters.month) === 12 ? parseInt(filters.year) + 1 : filters.year;
      const nextMonthStr = nextMonth.toString().padStart(2, '0');
      const endDate = `${nextYear}-${nextMonthStr}-01 00:00:00.000Z`;

      let filterQuery = `tanggal >= "${startDate}" && tanggal < "${endDate}"`;
      if (filters.pegawaiId !== 'all') {
        const selectedPegawai = pList.find(p => p.id_pegawai === filters.pegawaiId);
        if (selectedPegawai) {
          filterQuery += ` && nama_pegawai = "${selectedPegawai.nama_lengkap}"`;
        }
      }

      const records = await pb.collection('absen_pegawai').getFullList({
        filter: filterQuery,
        sort: 'nama_pegawai',
        $autoCancel: false
      });

      setRawRecords(records);

      let totalHadir = 0, totalIzin = 0, totalSakit = 0, totalTerlambat = 0;
      const userStats = {};

      records.forEach(r => {
        if (r.status === 'Hadir') totalHadir++;
        else if (r.status === 'Izin') totalIzin++;
        else if (r.status === 'Sakit') totalSakit++;
        else if (r.status === 'Terlambat') totalTerlambat++;

        if (!userStats[r.nama_pegawai]) {
          userStats[r.nama_pegawai] = { 
            id_pegawai: pMap[r.nama_pegawai] || '-',
            nama: r.nama_pegawai, 
            Hadir: 0, Izin: 0, Sakit: 0, Terlambat: 0 
          };
        }
        userStats[r.nama_pegawai][r.status]++;
      });

      const total = records.length;
      const persentase = total > 0 ? Math.round(((totalHadir + totalTerlambat) / total) * 100) : 0;

      setStats({ totalHadir, totalIzin, totalSakit, totalTerlambat, persentase });
      
      // Sort the chart data based on selected field and direction
      const sortedChartData = Object.values(userStats).sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      setChartData(sortedChartData);
      
      setPieData([
        { name: 'Hadir', value: totalHadir, color: 'hsl(var(--status-hadir))' },
        { name: 'Izin', value: totalIzin, color: 'hsl(var(--status-izin))' },
        { name: 'Sakit', value: totalSakit, color: 'hsl(var(--status-sakit))' },
        { name: 'Terlambat', value: totalTerlambat, color: 'hsl(var(--status-terlambat))' }
      ].filter(d => d.value > 0));

    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportPDF = async () => {
    if (!printRef.current || rawRecords.length === 0) return toast.warning('Tidak ada data untuk diekspor');
    setExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_Absen_${filters.year}_${filters.month}.pdf`);
      
      await logActivity('Export PDF', 'Lainnya', 'Mengekspor laporan absensi (PDF)', 'Sukses');
      toast.success('PDF berhasil diunduh');
    } catch (err) {
      toast.error('Gagal export PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = async () => {
    if (rawRecords.length === 0) return toast.warning('Tidak ada data untuk diekspor');
    try {
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Rekap Pegawai
      const rekapData = [['ID Pegawai', 'Nama Pegawai', 'Hadir', 'Izin', 'Sakit', 'Terlambat', 'Total']];
      chartData.forEach(d => {
        rekapData.push([d.id_pegawai, d.nama, d.Hadir, d.Izin, d.Sakit, d.Terlambat, d.Hadir+d.Izin+d.Sakit+d.Terlambat]);
      });
      const wsRekap = XLSX.utils.aoa_to_sheet(rekapData);
      XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi');

      // Sheet 2: Detail
      const detailData = rawRecords.map(r => ({
        'Tanggal': new Date(r.tanggal).toLocaleDateString('id-ID'),
        'ID Pegawai': pegawaiMap[r.nama_pegawai] || '-',
        'Nama Pegawai': r.nama_pegawai,
        'Status': r.status,
        'Jam Masuk': r.jam_masuk || '-',
        'Jam Keluar': r.jam_keluar || '-',
        'Keterangan': r.keterangan || '-'
      }));
      const wsDetail = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Absensi');

      XLSX.writeFile(wb, `Laporan_Absensi_${filters.year}_${filters.month}.xlsx`);
      await logActivity('Export Excel', 'Lainnya', 'Mengekspor laporan absensi (Excel)', 'Sukses');
      toast.success('Excel berhasil diunduh');
    } catch (err) {
      toast.error('Gagal export Excel');
    }
  };

  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const years = Array.from({length: 5}, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <>
      <Helmet>
        <title>Laporan Absensi - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Laporan Kehadiran</h1>
                  <p className="text-muted-foreground mt-1">Analisis dan ekspor data absensi pegawai bulanan.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={filters.pegawaiId} onValueChange={v => setFilters({...filters, pegawaiId: v})}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Semua Pegawai" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pegawai</SelectItem>
                      {pegawaiList.map(p => (
                        <SelectItem key={p.id} value={p.id_pegawai}>{p.id_pegawai} - {p.nama_lengkap}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.month} onValueChange={v => setFilters({...filters, month: v})}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {months.map((m, i) => <SelectItem key={i} value={(i+1).toString().padStart(2, '0')}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.year} onValueChange={v => setFilters({...filters, year: v})}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>

                  <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={exportPDF} disabled={loading || exporting}>
                    <FileText className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={exportExcel} disabled={loading || exporting}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-b-4 border-b-[hsl(var(--status-hadir))] shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <CheckCircle className="w-6 h-6 text-[hsl(var(--status-hadir))] mb-2" />
                    <p className="text-2xl font-bold">{stats.totalHadir}</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Hadir</p>
                  </CardContent>
                </Card>
                <Card className="border-b-4 border-b-[hsl(var(--status-terlambat))] shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <Clock className="w-6 h-6 text-[hsl(var(--status-terlambat))] mb-2" />
                    <p className="text-2xl font-bold">{stats.totalTerlambat}</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Terlambat</p>
                  </CardContent>
                </Card>
                <Card className="border-b-4 border-b-[hsl(var(--status-izin))] shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <AlertTriangle className="w-6 h-6 text-[hsl(var(--status-izin))] mb-2" />
                    <p className="text-2xl font-bold">{stats.totalIzin}</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Izin</p>
                  </CardContent>
                </Card>
                <Card className="border-b-4 border-b-[hsl(var(--status-sakit))] shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <UserX className="w-6 h-6 text-[hsl(var(--status-sakit))] mb-2" />
                    <p className="text-2xl font-bold">{stats.totalSakit}</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sakit</p>
                  </CardContent>
                </Card>
                <Card className="border-b-4 border-b-primary shadow-sm bg-primary/5">
                  <CardContent className="p-4 sm:p-6">
                    <Users className="w-6 h-6 text-primary mb-2" />
                    <p className="text-2xl font-bold text-primary">{stats.persentase}%</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate Kehadiran</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm border-none bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Kehadiran per Pegawai</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? <div className="h-[300px] animate-pulse bg-muted rounded-xl"></div> : (
                      chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey={sortField === 'id_pegawai' ? 'id_pegawai' : 'nama'} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="Hadir" stackId="a" fill="hsl(var(--status-hadir))" radius={[0, 0, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="Terlambat" stackId="a" fill="hsl(var(--status-terlambat))" radius={[0, 0, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="Izin" stackId="a" fill="hsl(var(--status-izin))" radius={[0, 0, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="Sakit" stackId="a" fill="hsl(var(--status-sakit))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">Tidak ada data</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Distribusi Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? <div className="h-[300px] animate-pulse bg-muted rounded-xl"></div> : (
                      pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">Tidak ada data</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Hidden Print Container */}
              <div className="absolute left-[-9999px] top-0 overflow-hidden h-0 w-0">
                <div ref={printRef} className="bg-white p-10 min-w-[800px] text-black font-sans">
                  <div className="border-b-2 border-primary pb-4 mb-6 text-center">
                    <h1 className="text-2xl font-bold text-primary mb-1">LAPORAN ABSENSI PEGAWAI</h1>
                    <p className="text-sm text-gray-600">Periode: {months[parseInt(filters.month)-1]} {filters.year}</p>
                    {filters.pegawaiId !== 'all' && (
                      <p className="text-sm font-semibold text-gray-700 mt-1">Pegawai: {filters.pegawaiId}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="border border-gray-300 p-3 text-center bg-gray-50"><p className="text-xs uppercase">Hadir</p><p className="text-xl font-bold">{stats.totalHadir}</p></div>
                    <div className="border border-gray-300 p-3 text-center bg-gray-50"><p className="text-xs uppercase">Terlambat</p><p className="text-xl font-bold">{stats.totalTerlambat}</p></div>
                    <div className="border border-gray-300 p-3 text-center bg-gray-50"><p className="text-xs uppercase">Izin</p><p className="text-xl font-bold">{stats.totalIzin}</p></div>
                    <div className="border border-gray-300 p-3 text-center bg-gray-50"><p className="text-xs uppercase">Sakit</p><p className="text-xl font-bold">{stats.totalSakit}</p></div>
                  </div>

                  <table className="w-full border-collapse border border-gray-300 text-sm mb-8">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('id_pegawai')}>
                          ID Pegawai {sortField === 'id_pegawai' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="border border-gray-300 p-2 text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('nama')}>
                          Nama Pegawai {sortField === 'nama' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="border border-gray-300 p-2 text-center">Hadir</th>
                        <th className="border border-gray-300 p-2 text-center">Terlambat</th>
                        <th className="border border-gray-300 p-2 text-center">Izin</th>
                        <th className="border border-gray-300 p-2 text-center">Sakit</th>
                        <th className="border border-gray-300 p-2 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((d, i) => (
                        <tr key={i}>
                          <td className="border border-gray-300 p-2 font-mono text-xs">{d.id_pegawai}</td>
                          <td className="border border-gray-300 p-2">{d.nama}</td>
                          <td className="border border-gray-300 p-2 text-center">{d.Hadir}</td>
                          <td className="border border-gray-300 p-2 text-center">{d.Terlambat}</td>
                          <td className="border border-gray-300 p-2 text-center">{d.Izin}</td>
                          <td className="border border-gray-300 p-2 text-center">{d.Sakit}</td>
                          <td className="border border-gray-300 p-2 text-center font-bold">{d.Hadir+d.Terlambat+d.Izin+d.Sakit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-right mt-16">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
                </div>
              </div>

            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LaporanAbsenPage;

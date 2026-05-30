
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, AlertTriangle, UserX, Clock, ArrowUpRight, ClipboardList } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { Badge } from '@/components/ui/badge';

const AdminDashboardOverview = () => {
  const [stats, setStats] = useState({
    totalPegawai: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    terlambat: 0
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const today = new Date();
      const startOfDay = today.toISOString().split('T')[0] + ' 00:00:00.000Z';
      const endOfDay = today.toISOString().split('T')[0] + ' 23:59:59.999Z';

      // Fetch employees count (excluding Admin)
      const users = await pb.collection('users').getFullList({
        filter: `role != 'Admin'`,
        $autoCancel: false
      });

      // Fetch today's attendance records
      const attendances = await pb.collection('absen_pegawai').getFullList({
        filter: `tanggal >= "${startOfDay}" && tanggal <= "${endOfDay}"`,
        sort: '-timestamp_masuk',
        $autoCancel: false
      });

      let hadir = 0, izin = 0, sakit = 0, terlambat = 0;
      attendances.forEach(a => {
        if (a.status === 'Hadir') hadir++;
        if (a.status === 'Izin') izin++;
        if (a.status === 'Sakit') sakit++;
        if (a.status === 'Terlambat') terlambat++;
      });

      setStats({
        totalPegawai: users.length,
        hadir,
        izin,
        sakit,
        terlambat
      });

      setRecentRecords(attendances.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch admin overview data', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hadir': return <Badge className="bg-[hsl(var(--status-hadir))]">Hadir</Badge>;
      case 'Izin': return <Badge className="bg-[hsl(var(--status-izin))]">Izin</Badge>;
      case 'Sakit': return <Badge className="bg-[hsl(var(--status-sakit))]">Sakit</Badge>;
      case 'Terlambat': return <Badge className="bg-[hsl(var(--status-terlambat))]">Terlambat</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center animate-pulse bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground">Memuat data ringkasan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Users className="w-6 h-6 text-primary mb-3" />
            <p className="text-2xl font-bold">{stats.totalPegawai}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Pegawai</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <UserCheck className="w-6 h-6 text-[hsl(var(--status-hadir))] mb-3" />
            <p className="text-2xl font-bold">{stats.hadir}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hadir Hari Ini</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Clock className="w-6 h-6 text-[hsl(var(--status-terlambat))] mb-3" />
            <p className="text-2xl font-bold">{stats.terlambat}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Terlambat</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <AlertTriangle className="w-6 h-6 text-[hsl(var(--status-izin))] mb-3" />
            <p className="text-2xl font-bold">{stats.izin}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Izin</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <UserX className="w-6 h-6 text-[hsl(var(--status-sakit))] mb-3" />
            <p className="text-2xl font-bold">{stats.sakit}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sakit</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-none bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div>
              <CardTitle className="text-lg">Aktivitas Absensi Terbaru</CardTitle>
              <CardDescription>Pegawai yang baru saja melakukan absensi hari ini</CardDescription>
            </div>
            <Link to="/data-absen">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Lihat Semua <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentRecords.length > 0 ? (
              <div className="divide-y divide-border">
                {recentRecords.map(record => (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">{record.nama_pegawai}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Masuk: {record.jam_masuk} {record.jam_keluar ? `| Keluar: ${record.jam_keluar}` : ''}
                      </p>
                    </div>
                    <div>{getStatusBadge(record.status)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <ClipboardList className="w-8 h-8 mb-2 opacity-50" />
                <p>Belum ada data absensi hari ini</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm border-none bg-card bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2 text-foreground">Akses Cepat</h3>
              <p className="text-sm text-muted-foreground mb-4">Pintasan menuju laporan dan rekap data.</p>
              <div className="space-y-3">
                <Link to="/data-absen" className="block w-full">
                  <Button className="w-full justify-start" variant="secondary">
                    <ClipboardList className="mr-2 w-4 h-4 text-primary" /> Data Absensi Harian
                  </Button>
                </Link>
                <Link to="/laporan-absen" className="block w-full">
                  <Button className="w-full justify-start" variant="secondary">
                    <Clock className="mr-2 w-4 h-4 text-primary" /> Laporan Bulanan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;

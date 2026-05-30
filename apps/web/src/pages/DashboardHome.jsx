
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTokoInfo } from '@/contexts/LogoContext.jsx';
import pb from '@/lib/pocketbaseClient';
import AttendanceStatusCard from '@/components/AttendanceStatusCard.jsx';
import AdminDashboardOverview from '@/components/AdminDashboardOverview.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, MapPin, Phone, Mail, Clock } from 'lucide-react';

const DashboardHome = () => {
  const { currentUser } = useAuth();
  const { tokoInfo, logoUrl } = useTokoInfo();
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    if (!isAdmin && currentUser) {
      checkTodayAttendance();
    } else {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  const checkTodayAttendance = async () => {
    try {
      const today = new Date();
      const startOfDay = today.toISOString().split('T')[0] + ' 00:00:00.000Z';
      const endOfDay = today.toISOString().split('T')[0] + ' 23:59:59.999Z';

      const records = await pb.collection('absen_pegawai').getList(1, 1, {
        filter: `user_id = "${currentUser.id}" && tanggal >= "${startOfDay}" && tanggal <= "${endOfDay}"`,
        $autoCancel: false
      });

      if (records.items.length > 0) {
        setTodayRecord(records.items[0]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Home - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {loading ? (
                <div className="h-48 flex items-center justify-center animate-pulse bg-card rounded-2xl border border-border">
                  <p className="text-muted-foreground">Memuat dashboard...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      {!isAdmin ? (
                        <AttendanceStatusCard 
                          currentUser={currentUser} 
                          todayRecord={todayRecord} 
                        />
                      ) : (
                        <>
                          <div className="mb-2">
                            <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, {currentUser?.nama_lengkap || 'Admin'}</h1>
                            <p className="text-muted-foreground mt-1">Pantau seluruh aktivitas absensi dan operasional dari dashboard utama.</p>
                          </div>
                          <AdminDashboardOverview />
                        </>
                      )}
                    </div>

                    <div className="lg:col-span-1">
                      <Card className="shadow-sm border-border h-full bg-card">
                        <CardHeader className="pb-4 border-b bg-muted/10">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Store className="w-5 h-5 text-primary" />
                            Informasi Toko
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            {logoUrl ? (
                              <div className="w-24 h-24 rounded-xl border shadow-sm overflow-hidden bg-white p-2">
                                <img src={logoUrl} alt="Logo Toko" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-24 h-24 rounded-xl border shadow-sm bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                {tokoInfo?.nama_toko?.substring(0, 2).toUpperCase() || 'DG'}
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-xl">{tokoInfo?.nama_toko || 'DG Komputer'}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{tokoInfo?.deskripsi_toko || 'Sistem Manajemen Toko'}</p>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-start gap-3 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-foreground/90">
                                {tokoInfo?.alamat_toko || 'Jl. Teknologi No. 123'}<br/>
                                {tokoInfo?.kota ? `${tokoInfo.kota}, ${tokoInfo.provinsi}` : 'Jakarta Selatan'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-foreground/90">{tokoInfo?.nomor_telepon || '(021) 1234-5678'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-foreground/90">{tokoInfo?.email_toko || 'info@dgkomputer.com'}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-foreground/90">
                                {tokoInfo?.jam_operasional || 'Senin - Jumat: 09:00 - 18:00'}
                                {tokoInfo?.hari_libur && tokoInfo.hari_libur.length > 0 && (
                                  <span className="block text-destructive/80 mt-1">Libur: {tokoInfo.hari_libur.join(', ')}</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}

            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default DashboardHome;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, ArrowLeft, Edit, Trash2, MapPin, Clock, Calendar, User, Briefcase, Mail, Phone, Fingerprint, FileImage } from 'lucide-react';
import GPSMap from '@/components/GPSMap.jsx';
import EditAbsenModal from '@/components/EditAbsenModal.jsx';
import DeleteAbsenDialog from '@/components/DeleteAbsenDialog.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const DetailAbsenPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [error, setError] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Absen Record
      const absenData = await pb.collection('absen_pegawai').getOne(id, { $autoCancel: false });
      setRecord(absenData);

      // 2. Fetch Pegawai Record based on nama_pegawai
      try {
        const pegawaiData = await pb.collection('pegawai').getFirstListItem(`nama_lengkap="${absenData.nama_pegawai}"`, { $autoCancel: false });
        setPegawai(pegawaiData);
      } catch (pegawaiErr) {
        console.warn('Pegawai record not found for name:', absenData.nama_pegawai);
        toast.warning('Profil detail pegawai tidak ditemukan di database.');
      }
      
    } catch (err) {
      console.error(err);
      setError('Data absen tidak ditemukan atau telah dihapus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hadir': return <Badge className="bg-[hsl(var(--status-hadir))] text-white">Hadir</Badge>;
      case 'Izin': return <Badge className="bg-[hsl(var(--status-izin))] text-white">Izin</Badge>;
      case 'Sakit': return <Badge className="bg-[hsl(var(--status-sakit))] text-white">Sakit</Badge>;
      case 'Terlambat': return <Badge className="bg-[hsl(var(--status-terlambat))] text-white">Terlambat</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const parseLocation = (locString) => {
    if (!locString) return null;
    const parts = locString.split(',');
    if (parts.length === 2) {
      return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
    }
    return null;
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex flex-col items-center justify-center">
            <Card className="w-full max-w-md text-center p-8 border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">{error}</h2>
              <p className="text-muted-foreground mb-6">Data yang Anda cari tidak tersedia di sistem.</p>
              <Button onClick={() => navigate('/data-absen')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Data Absen
              </Button>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const mapLocation = record ? parseLocation(record.lokasi_masuk) : null;
  const imageUrl = record && record.foto_masuk ? pb.files.getUrl(record, record.foto_masuk) : null;
  const imageOutUrl = record && record.foto_keluar ? pb.files.getUrl(record, record.foto_keluar) : null;

  return (
    <>
      <Helmet>
        <title>Detail Absen - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Breadcrumb & Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Link to="/dashboard-home" className="hover:text-primary transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <Link to="/data-absen" className="hover:text-primary transition-colors">Riwayat Absen</Link>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <span className="text-foreground font-medium">Detail Absen</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Kehadiran</h1>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigate('/data-absen')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                  </Button>
                  <Button variant="secondary" onClick={() => setEditModalOpen(true)} disabled={loading}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={loading}>
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                  </Button>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Info Pegawai & Absen */}
                <div className="space-y-6 lg:col-span-1">
                  
                  {/* Info Pegawai */}
                  <Card className="shadow-sm border-none bg-card overflow-hidden">
                    <div className="h-2 bg-primary w-full"></div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Info Pegawai
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border border-border/50">
                            <div className="bg-primary/10 p-2 rounded-md">
                              <Fingerprint className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">ID Pegawai</p>
                              <p className="font-mono font-bold text-sm">{pegawai ? pegawai.id_pegawai : '-'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Nama</span>
                              <span className="col-span-2 font-medium">{record.nama_pegawai}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> Posisi</span>
                              <span className="col-span-2">{pegawai?.posisi || '-'} ({pegawai?.departemen || '-'})</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Email</span>
                              <span className="col-span-2 truncate">{pegawai?.email || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Telepon</span>
                              <span className="col-span-2">{pegawai?.nomor_telepon || '-'}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Info Absen */}
                  <Card className="shadow-sm border-none bg-card">
                    <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" /> Detail Waktu
                        </div>
                        {!loading && getStatusBadge(record.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                      {loading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Tanggal Absen</p>
                            <p className="font-medium">{new Date(record.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                            <div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5"/> Jam Masuk</p>
                              <p className="font-mono font-bold text-lg">{record.jam_masuk || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5"/> Jam Keluar</p>
                              <p className="font-mono font-bold text-lg">{record.jam_keluar || '-'}</p>
                            </div>
                          </div>

                          {record.keterangan && (
                            <div className="bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                              <p className="text-xs font-semibold text-orange-800 dark:text-orange-400 mb-1">Keterangan / Alasan</p>
                              <p className="text-sm text-orange-900 dark:text-orange-200 leading-relaxed">{record.keterangan}</p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Map & Photos */}
                <div className="space-y-6 lg:col-span-2">
                  
                  {/* Map Section */}
                  <Card className="shadow-sm border-none bg-card h-full flex flex-col">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> Lokasi GPS Masuk
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-[350px]">
                      {loading ? (
                        <Skeleton className="w-full h-full min-h-[300px] rounded-xl" />
                      ) : mapLocation ? (
                        <div className="flex-1 rounded-xl overflow-hidden border border-border">
                          <GPSMap initialLocation={{ ...mapLocation, address: record.alamat_lokasi }} readOnly={true} />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-xl border border-dashed">
                          <p className="text-muted-foreground">Data koordinat tidak valid.</p>
                        </div>
                      )}
                      
                      {!loading && record?.alamat_lokasi && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm flex items-start gap-2 border border-border/50">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{record.alamat_lokasi}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Photo Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-none bg-card">
                      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileImage className="w-4 h-4 text-primary" /> Foto Masuk
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {loading ? (
                          <Skeleton className="w-full h-48 rounded-b-xl" />
                        ) : imageUrl ? (
                          <div className="relative group overflow-hidden rounded-b-xl bg-black">
                            <img src={imageUrl} alt="Foto Masuk" className="w-full h-auto object-cover max-h-[300px] opacity-90 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ) : (
                          <div className="h-48 flex items-center justify-center bg-muted rounded-b-xl">
                            <p className="text-muted-foreground text-sm">Tidak ada foto</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-none bg-card">
                      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileImage className="w-4 h-4 text-primary" /> Foto Keluar
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {loading ? (
                          <Skeleton className="w-full h-48 rounded-b-xl" />
                        ) : imageOutUrl ? (
                          <div className="relative group overflow-hidden rounded-b-xl bg-black">
                            <img src={imageOutUrl} alt="Foto Keluar" className="w-full h-auto object-cover max-h-[300px] opacity-90 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ) : (
                          <div className="h-48 flex items-center justify-center bg-muted rounded-b-xl">
                            <p className="text-muted-foreground text-sm">Tidak ada foto keluar</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </div>

            </div>
          </main>
        </div>
        <Footer />
      </div>

      {record && (
        <>
          <EditAbsenModal 
            isOpen={editModalOpen} 
            onClose={() => setEditModalOpen(false)} 
            record={record} 
            onSuccess={fetchData} 
          />
          <DeleteAbsenDialog 
            isOpen={deleteDialogOpen} 
            onClose={() => setDeleteDialogOpen(false)} 
            recordId={record.id} 
            onSuccess={() => navigate('/data-absen')} 
          />
        </>
      )}
    </>
  );
};

export default DetailAbsenPage;

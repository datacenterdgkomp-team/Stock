import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import FormPegawaiModal from '@/components/FormPegawaiModal.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Briefcase, Calendar, Info, Clock, AlertCircle, Copy, WalletCards } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DetailPegawaiPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [absenData, setAbsenData] = useState([]);
  const [loadingAbsen, setLoadingAbsen] = useState(false);

  useEffect(() => {
    fetchPegawai();
  }, [id]);

  const fetchPegawai = async () => {
    setLoading(true);
    try {
      const record = await pb.collection('pegawai').getOne(id, { $autoCancel: false });
      setPegawai(record);
      fetchAbsensi(record.email);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil detail pegawai');
      navigate('/pegawai');
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsensi = async (email) => {
    setLoadingAbsen(true);
    try {
      const userList = await pb.collection('users').getList(1, 1, { filter: `email="${email}"`, $autoCancel: false });
      if (userList.items.length > 0) {
        const userId = userList.items[0].id;
        const records = await pb.collection('absen_pegawai').getList(1, 20, {
          filter: `user_id="${userId}"`,
          sort: '-tanggal',
          $autoCancel: false
        });
        setAbsenData(records.items);
      }
    } catch (error) {
      console.error('Error fetching absen:', error);
    } finally {
      setLoadingAbsen(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('ID Pegawai disalin ke clipboard');
  };

  const handleDelete = async () => {
    try {
      await pb.collection('pegawai').delete(id, { $autoCancel: false });
      toast.success('Pegawai berhasil dihapus');
      navigate('/pegawai');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus pegawai');
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8"><Skeleton className="h-[500px] w-full rounded-xl" /></main>
        </div>
      </div>
    );
  }

  if (!pegawai) return null;

  return (
    <>
      <Helmet>
        <title>Detail {pegawai.nama_lengkap} - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
              
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/pegawai')} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                  </Button>
                </div>
              </div>

              {/* Profile Header Card */}
              <Card className="border-none shadow-md overflow-hidden bg-card relative">
                <div className="h-32 bg-primary/10 w-full absolute top-0 left-0"></div>
                <CardContent className="p-6 md:p-8 relative z-10 pt-16 md:pt-16 flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <Avatar className="w-32 h-32 border-4 border-card shadow-lg">
                    <AvatarImage src={pegawai.foto_profil ? pb.files.getUrl(pegawai, pegawai.foto_profil) : null} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-primary/20 text-primary font-bold">
                      {pegawai.nama_lengkap.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left mt-2">
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                      {pegawai.id_pegawai && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600 text-white hover:bg-blue-700 text-base py-1.5 px-4 font-mono font-bold tracking-widest shadow-md flex items-center gap-2">
                            <WalletCards className="w-4 h-4" />
                            ID Pegawai: {pegawai.id_pegawai}
                          </Badge>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => copyToClipboard(pegawai.id_pegawai)} title="Copy to Clipboard">
                            <Copy className="h-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{pegawai.nama_lengkap}</h1>
                        <p className="text-lg text-primary font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                          {pegawai.posisi} di {pegawai.departemen}
                        </p>
                      </div>
                      <div>
                        <Badge className={`px-3 py-1 text-sm ${pegawai.status_kerja === 'Aktif' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}>
                          {pegawai.status_kerja}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 text-sm text-muted-foreground">
                      <span className="flex items-center"><Mail className="w-4 h-4 mr-2" /> {pegawai.email}</span>
                      <span className="flex items-center"><Phone className="w-4 h-4 mr-2" /> {pegawai.nomor_telepon || '-'}</span>
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {pegawai.alamat ? pegawai.alamat.substring(0, 30) + '...' : '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="profil" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                  <TabsTrigger value="profil">Profil Detail</TabsTrigger>
                  <TabsTrigger value="absen">Riwayat Absensi</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profil" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-border shadow-sm">
                      <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="text-lg flex items-center"><Briefcase className="w-5 h-5 mr-2 text-primary" /> Data Pekerjaan</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <dl className="divide-y divide-border text-sm">
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Tanggal Gabung</dt>
                            <dd className="col-span-2 text-foreground">{new Date(pegawai.tanggal_bergabung).toLocaleDateString('id-ID')}</dd>
                          </div>
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Departemen</dt>
                            <dd className="col-span-2 text-foreground">{pegawai.departemen}</dd>
                          </div>
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Posisi</dt>
                            <dd className="col-span-2 text-foreground">{pegawai.posisi}</dd>
                          </div>
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Gaji Pokok</dt>
                            <dd className="col-span-2 text-foreground font-mono">{pegawai.gaji_pokok ? `Rp ${pegawai.gaji_pokok.toLocaleString('id-ID')}` : '-'}</dd>
                          </div>
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Tunjangan</dt>
                            <dd className="col-span-2 text-foreground font-mono">{pegawai.tunjangan ? `Rp ${pegawai.tunjangan.toLocaleString('id-ID')}` : '-'}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card className="border border-border shadow-sm">
                      <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="text-lg flex items-center"><Info className="w-5 h-5 mr-2 text-primary" /> Data Pribadi</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <dl className="divide-y divide-border text-sm">
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Nomor KTP</dt>
                            <dd className="col-span-2 text-foreground">{pegawai.nomor_identitas || '-'}</dd>
                          </div>
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Tanggal Lahir</dt>
                            <dd className="col-span-2 text-foreground">{pegawai.tanggal_lahir ? new Date(pegawai.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</dd>
                          </div>
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Jenis Kelamin</dt>
                            <dd className="col-span-2 text-foreground">{pegawai.jenis_kelamin || '-'}</dd>
                          </div>
                          <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-muted-foreground font-medium">Alamat Lengkap</dt>
                            <dd className="col-span-2 text-foreground">{pegawai.alamat || '-'}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border border-border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                      <CardTitle className="text-lg flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-destructive" /> Kontak Darurat & Catatan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Kontak Darurat</h4>
                        <div className="bg-muted/50 p-4 rounded-xl">
                          <p className="font-medium">{pegawai.nama_kontak_darurat || 'Tidak ada data'}</p>
                          {pegawai.nomor_kontak_darurat && (
                            <p className="text-muted-foreground mt-1 flex items-center"><Phone className="w-3 h-3 mr-2" /> {pegawai.nomor_kontak_darurat}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Catatan</h4>
                        <div className="bg-muted/50 p-4 rounded-xl min-h-[80px]">
                          <p className="text-sm">{pegawai.catatan || 'Tidak ada catatan.'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="absen" className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                  <Card className="border border-border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="text-lg flex items-center"><Clock className="w-5 h-5 mr-2 text-primary" /> 20 Riwayat Terakhir</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {loadingAbsen ? (
                        <div className="p-8 text-center"><Skeleton className="h-8 w-full max-w-sm mx-auto" /></div>
                      ) : absenData.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Belum ada riwayat absensi untuk pegawai ini.</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Masuk</TableHead>
                              <TableHead>Keluar</TableHead>
                              <TableHead>Lokasi Masuk</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {absenData.map((absen) => (
                              <TableRow key={absen.id}>
                                <TableCell className="font-medium">{new Date(absen.tanggal).toLocaleDateString('id-ID')}</TableCell>
                                <TableCell>
                                  <Badge variant={absen.status === 'Hadir' ? 'default' : absen.status === 'Izin' ? 'outline' : 'destructive'} 
                                         className={absen.status === 'Hadir' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                    {absen.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{absen.jam_masuk}</TableCell>
                                <TableCell>{absen.jam_keluar || '-'}</TableCell>
                                <TableCell className="truncate max-w-[200px]" title={absen.alamat_lokasi}>{absen.alamat_lokasi || 'GPS'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </div>
          </main>
        </div>
        <Footer />
      </div>

      <FormPegawaiModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchPegawai}
        initialData={pegawai}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data <strong>{pegawai.nama_lengkap}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus Pegawai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DetailPegawaiPage;
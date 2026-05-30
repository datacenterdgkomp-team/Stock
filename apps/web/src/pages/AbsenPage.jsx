
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CameraCapture from '@/components/CameraCapture.jsx';
import GPSMap from '@/components/GPSMap.jsx';
import { Clock, Calendar as CalendarIcon, CheckCircle2, UserCheck, AlertCircle, ArrowLeft, Fingerprint, Mail, Loader2, XCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { logActivity } from '@/lib/ActivityLogHelper.js';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'Hadir', label: 'HADIR', colorClass: 'bg-[hsl(var(--status-hadir))] hover:bg-[hsl(var(--status-hadir))]/90 text-white' },
  { value: 'Izin', label: 'IZIN', colorClass: 'bg-[hsl(var(--status-izin))] hover:bg-[hsl(var(--status-izin))]/90 text-white' },
  { value: 'Sakit', label: 'SAKIT', colorClass: 'bg-[hsl(var(--status-sakit))] hover:bg-[hsl(var(--status-sakit))]/90 text-white' }
];

const AbsenPage = () => {
  const { currentUser, employeeData } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  
  const [location, setLocation] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('Hadir');
  const [keterangan, setKeterangan] = useState('');

  // ID Pegawai logic
  const [idPegawai, setIdPegawai] = useState('');
  const [namaPegawai, setNamaPegawai] = useState('');
  const [selectedUserRecord, setSelectedUserRecord] = useState(null);
  
  const [pegawaiList, setPegawaiList] = useState([]);
  const [filteredPegawai, setFilteredPegawai] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [idValidation, setIdValidation] = useState({ state: 'idle', message: '' });
  
  const dropdownRef = useRef(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Pegawai profile / list
  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          if (employeeData) {
            setIdPegawai(employeeData.id_pegawai);
            setNamaPegawai(employeeData.nama_lengkap);
            setSelectedUserRecord(currentUser);
            setIdValidation({ state: 'valid', message: '' });
          } else {
            toast.warning('Akun Anda belum memiliki profil Pegawai. Harap hubungi admin.');
            setIdValidation({ state: 'error', message: 'Profil pegawai tidak ditemukan' });
          }
          await checkTodayAttendance(currentUser.id);
        } else {
          // Unauthenticated user - fetch list for autocomplete
          const list = await pb.collection('pegawai').getFullList({ 
            sort: 'id_pegawai',
            $autoCancel: false 
          });
          setPegawaiList(list);
        }
      } catch (error) {
        console.error('Failed to init profile:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeProfile();
  }, [currentUser, employeeData]);

  // Real-time ID Validation & Autocomplete filtering
  useEffect(() => {
    if (currentUser) return; // Skip if logged in

    const val = idPegawai.trim();
    
    // Filter dropdown
    if (val) {
      const filtered = pegawaiList.filter(p => 
        p.id_pegawai.toLowerCase().includes(val.toLowerCase()) ||
        p.nama_lengkap.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredPegawai(filtered);
    } else {
      setFilteredPegawai(pegawaiList);
    }

    // Validation logic
    const validateId = async () => {
      if (!val) {
        setIdValidation({ state: 'idle', message: '' });
        setNamaPegawai('');
        setSelectedUserRecord(null);
        setTodayRecord(null);
        return;
      }

      setIdValidation({ state: 'loading', message: '' });

      const match = pegawaiList.find(p => p.id_pegawai.toLowerCase() === val.toLowerCase());

      if (match) {
        setNamaPegawai(match.nama_lengkap);
        try {
          const uRes = await pb.collection('users').getList(1, 1, {
            filter: `email="${match.email}"`,
            $autoCancel: false
          });
          
          if (uRes.items.length > 0) {
            setSelectedUserRecord(uRes.items[0]);
            setIdValidation({ state: 'valid', message: '' });
            await checkTodayAttendance(uRes.items[0].id);
          } else {
            setSelectedUserRecord(null);
            setTodayRecord(null);
            setIdValidation({ state: 'error', message: 'Akun sistem belum dibuat untuk ID ini' });
          }
        } catch (err) {
          setSelectedUserRecord(null);
          setTodayRecord(null);
          setIdValidation({ state: 'error', message: 'Gagal memverifikasi akun' });
        }
      } else {
        setNamaPegawai('');
        setSelectedUserRecord(null);
        setTodayRecord(null);
        setIdValidation({ state: 'error', message: 'ID Pegawai tidak ditemukan' });
      }
    };

    const timer = setTimeout(validateId, 400); // Debounce
    return () => clearTimeout(timer);
  }, [idPegawai, pegawaiList, currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkTodayAttendance = async (userId) => {
    if (!userId) return;
    try {
      const today = new Date();
      const startOfDay = today.toISOString().split('T')[0] + ' 00:00:00.000Z';
      const endOfDay = today.toISOString().split('T')[0] + ' 23:59:59.999Z';

      const records = await pb.collection('absen_pegawai').getList(1, 1, {
        filter: `user_id = "${userId}" && tanggal >= "${startOfDay}" && tanggal <= "${endOfDay}"`,
        $autoCancel: false
      });

      if (records.items.length > 0) {
        setTodayRecord(records.items[0]);
      } else {
        setTodayRecord(null);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleLocationFound = (loc) => setLocation(loc);
  const handlePhotoCapture = (blob) => setPhotoBlob(blob);

  const handleSubmit = async () => {
    if (!idPegawai) {
      toast.error('ID Pegawai wajib diisi');
      return;
    }
    if (idValidation.state !== 'valid') {
      toast.error('ID Pegawai tidak valid atau tidak ditemukan');
      return;
    }
    if (!selectedUserRecord) return toast.error('Identitas pegawai tidak valid atau akun belum ada di sistem.');
    if (!location) return toast.error('Lokasi GPS belum terdeteksi');
    if (!photoBlob) return toast.error('Silakan ambil foto selfie terlebih dahulu');
    if ((selectedStatus === 'Izin' || selectedStatus === 'Sakit') && !keterangan.trim()) {
      return toast.error('Keterangan wajib diisi untuk Izin atau Sakit');
    }

    setIsSubmitting(true);
    try {
      const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      const coordStr = `${location.lat},${location.lng}`;
      const isoDateStr = new Date().toISOString().split('T')[0] + ' 00:00:00.000Z';

      const formData = new FormData();
      
      if (!todayRecord) {
        // Check-In
        formData.append('user_id', selectedUserRecord.id);
        formData.append('nama_pegawai', namaPegawai);
        formData.append('tanggal', isoDateStr);
        formData.append('jam_masuk', timeStr);
        formData.append('status', selectedStatus);
        formData.append('lokasi_masuk', coordStr);
        formData.append('alamat_lokasi', location.address || '');
        formData.append('timestamp_masuk', new Date().toISOString());
        formData.append('foto_masuk', photoBlob, `masuk_${selectedUserRecord.id}.jpg`);
        if (keterangan) formData.append('keterangan', keterangan);

        await pb.collection('absen_pegawai').create(formData, { $autoCancel: false });
        if (currentUser) {
          await logActivity('Absen Masuk', 'Lainnya', `Berhasil absen masuk (${selectedStatus})`, 'Sukses');
        }
        toast.success(`Absen berhasil dengan ID: ${idPegawai}`);
      } else {
        // Check-Out
        formData.append('jam_keluar', timeStr);
        formData.append('lokasi_keluar', coordStr);
        formData.append('timestamp_keluar', new Date().toISOString());
        formData.append('foto_keluar', photoBlob, `keluar_${selectedUserRecord.id}.jpg`);
        if (keterangan) formData.append('keterangan', todayRecord.keterangan ? `${todayRecord.keterangan} | Checkout: ${keterangan}` : keterangan);

        await pb.collection('absen_pegawai').update(todayRecord.id, formData, { $autoCancel: false });
        if (currentUser) {
          await logActivity('Absen Keluar', 'Lainnya', `Berhasil absen keluar`, 'Sukses');
        }
        toast.success(`Absen keluar berhasil dengan ID: ${idPegawai}`);
      }
      
      // Auto redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate(currentUser ? '/dashboard-home' : '/login');
      }, 2000);
      
      setPhotoBlob(null);
      setLocation(null);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengirim data absen. Silakan coba lagi.');
      if (currentUser) {
        await logActivity(todayRecord ? 'Absen Keluar' : 'Absen Masuk', 'Lainnya', 'Gagal melakukan absensi', 'Gagal');
      }
      setIsSubmitting(false);
    }
  };

  const renderCompletedState = () => (
    <Card className="border-l-4 border-l-[hsl(var(--status-hadir))] shadow-md bg-green-50/30">
      <CardContent className="p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-[hsl(var(--status-hadir))]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Absensi Selesai</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Anda sudah menyelesaikan absensi masuk dan keluar untuk hari ini. Selamat beristirahat!
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md text-sm border-t border-border pt-6 mb-6">
          <div>
            <p className="text-muted-foreground">Jam Masuk</p>
            <p className="font-semibold text-lg">{todayRecord?.jam_masuk}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Jam Keluar</p>
            <p className="font-semibold text-lg">{todayRecord?.jam_keluar}</p>
          </div>
        </div>
        <Button onClick={() => navigate(currentUser ? '/dashboard-home' : '/login')} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Absensi - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          {currentUser && <Sidebar />}
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                  <UserCheck className="w-48 h-48 -mt-8 -mr-8" />
                </div>
                <div className="z-10">
                  <h1 className="text-2xl font-bold tracking-tight mb-1">
                    Halo, {namaPegawai || 'Pegawai'}!
                  </h1>
                  <p className="text-primary-foreground/80 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="z-10 bg-black/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  <span className="text-3xl font-bold font-mono tracking-wider">
                    {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </span>
                </div>
              </div>

              {currentUser && employeeData && (
                <div className="bg-card border border-border shadow-sm p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-primary/10 p-3 rounded-full shrink-0">
                    <Fingerprint className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Info Pegawai 
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">Logged In</Badge>
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono"><Badge variant="outline" className="bg-muted">{employeeData.id_pegawai}</Badge></span>
                      <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> {employeeData.nama_lengkap}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {currentUser.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="h-64 flex items-center justify-center animate-pulse bg-card rounded-2xl border border-border">
                  <p className="text-muted-foreground">Menyiapkan form absensi...</p>
                </div>
              ) : todayRecord && todayRecord.jam_keluar ? (
                renderCompletedState()
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Form & Map */}
                  <div className="space-y-6">
                    {todayRecord && !todayRecord.jam_keluar && (
                      <Card className="border-l-4 border-l-primary bg-primary/5 border-r-0 border-t-0 border-b-0 shadow-sm">
                        <CardContent className="p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Anda sudah absen masuk hari ini</p>
                            <p className="text-sm text-muted-foreground mt-1">Jam masuk: <span className="font-semibold text-foreground">{todayRecord.jam_masuk}</span></p>
                            <p className="text-sm text-muted-foreground mt-2">Silakan ambil foto dan lokasi baru untuk <strong>Absen Keluar</strong>.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="shadow-sm border-border">
                      <CardHeader className="bg-muted/30 pb-4 border-b">
                        <CardTitle className="text-lg">Detail Absensi</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-5">
                        
                        <div className="space-y-4">
                          <div className="space-y-2" ref={dropdownRef}>
                            <Label>ID Pegawai <span className="text-destructive">*</span></Label>
                            {currentUser ? (
                              <Input value={idPegawai || ''} readOnly className="bg-muted font-mono tracking-widest text-primary font-bold" />
                            ) : (
                              <div className="relative">
                                <Input 
                                  value={idPegawai}
                                  onChange={(e) => {
                                    setIdPegawai(e.target.value);
                                    setShowDropdown(true);
                                  }}
                                  onFocus={() => setShowDropdown(true)}
                                  placeholder="Ketik atau pilih ID Pegawai..."
                                  className={`font-mono font-medium ${
                                    idValidation.state === 'error' ? 'border-destructive focus-visible:ring-destructive' : 
                                    idValidation.state === 'valid' ? 'border-emerald-500 focus-visible:ring-emerald-500' : ''
                                  }`}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                  {idValidation.state === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                                  {idValidation.state === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                  {idValidation.state === 'error' && <XCircle className="w-4 h-4 text-destructive" />}
                                </div>
                                
                                {showDropdown && (
                                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95">
                                    {filteredPegawai.length > 0 ? (
                                      filteredPegawai.map(p => (
                                        <div
                                          key={p.id}
                                          className="px-4 py-2.5 hover:bg-muted cursor-pointer text-sm flex justify-between items-center border-b border-border/50 last:border-0"
                                          onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent input blur
                                            setIdPegawai(p.id_pegawai);
                                            setShowDropdown(false);
                                          }}
                                        >
                                          <span className="font-mono font-bold text-primary">{p.id_pegawai}</span>
                                          <span className="text-muted-foreground">| {p.nama_lengkap}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">Tidak ada hasil</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {!currentUser && idValidation.state === 'error' && (
                              <p className="text-sm font-medium text-destructive mt-1.5 flex items-center gap-1">
                                {idValidation.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Nama Pegawai</Label>
                            <Input 
                              value={namaPegawai || ''} 
                              readOnly 
                              className="bg-muted font-medium" 
                              placeholder="Nama akan terisi otomatis" 
                            />
                          </div>
                        </div>

                        {!todayRecord && (
                          <div className="space-y-3 pt-4 border-t">
                            <Label>Status Kehadiran</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {STATUS_OPTIONS.map(opt => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setSelectedStatus(opt.value)}
                                  className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                                    selectedStatus === opt.value 
                                      ? `${opt.colorClass} border-transparent shadow-md scale-[1.02]` 
                                      : 'bg-card text-foreground border-border hover:border-primary/50'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <Label>Keterangan {(!todayRecord && (selectedStatus === 'Izin' || selectedStatus === 'Sakit')) && <span className="text-destructive">*</span>}</Label>
                          <Textarea 
                            placeholder={todayRecord ? "Catatan akhir hari (opsional)" : "Alasan izin/sakit atau catatan (opsional)"}
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            className="resize-none min-h-[80px] bg-background text-foreground"
                          />
                        </div>

                      </CardContent>
                    </Card>

                  </div>

                  {/* Right Column: Camera & Map */}
                  <div className="space-y-6">
                    <Card className="shadow-sm border-border overflow-hidden">
                      <CardHeader className="bg-muted/30 pb-4 border-b">
                        <CardTitle className="text-lg">Lokasi Saat Ini</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <GPSMap onLocationFound={handleLocationFound} />
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border flex flex-col">
                      <CardHeader className="bg-muted/30 pb-4 border-b">
                        <CardTitle className="text-lg">Bukti Kehadiran</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 flex flex-col">
                        <div className="mb-6">
                          <CameraCapture onCapture={handlePhotoCapture} />
                        </div>
                        
                        <Button 
                          size="lg" 
                          className="w-full h-14 text-lg font-bold rounded-xl shadow-md transition-all"
                          onClick={handleSubmit}
                          disabled={isSubmitting || !photoBlob || !location || !selectedUserRecord || idValidation.state !== 'valid'}
                          variant={todayRecord ? "destructive" : "default"}
                        >
                          {isSubmitting ? 'MEMPROSES...' : (todayRecord ? 'ABSEN KELUAR SEKARANG' : 'KIRIM ABSEN MASUK')}
                        </Button>
                        
                        {(!photoBlob || !location || !selectedUserRecord || idValidation.state !== 'valid') && (
                          <p className="text-center text-xs text-muted-foreground mt-3">
                            * Lengkapi ID Pegawai, foto dan lokasi untuk absen
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                </div>
              )}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AbsenPage;

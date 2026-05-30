
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTokoInfo } from '@/contexts/LogoContext.jsx';
import LogoUploadField from '@/components/LogoUploadField.jsx';
import { toast } from 'sonner';
import { Loader2, Store, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const TokoInfoTab = () => {
  const { tokoInfo, logoUrl, updateTokoInfo, isLoading: isContextLoading } = useTokoInfo();
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const [formData, setFormData] = useState({
    nama_toko: '',
    alamat_toko: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
    nomor_telepon: '',
    email_toko: '',
    website: '',
    deskripsi_toko: '',
    jam_operasional: '',
    hari_libur: []
  });

  useEffect(() => {
    if (tokoInfo) {
      resetForm();
    }
  }, [tokoInfo]);

  const resetForm = () => {
    if (tokoInfo) {
      setFormData({
        nama_toko: tokoInfo.nama_toko || '',
        alamat_toko: tokoInfo.alamat_toko || '',
        kota: tokoInfo.kota || '',
        provinsi: tokoInfo.provinsi || '',
        kode_pos: tokoInfo.kode_pos || '',
        nomor_telepon: tokoInfo.nomor_telepon || '',
        email_toko: tokoInfo.email_toko || '',
        website: tokoInfo.website || '',
        deskripsi_toko: tokoInfo.deskripsi_toko || '',
        jam_operasional: tokoInfo.jam_operasional || '',
        hari_libur: tokoInfo.hari_libur || []
      });
      setPhotoFile(null);
      setPhotoRemoved(false);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const current = prev.hari_libur || [];
      if (current.includes(day)) {
        return { ...prev, hari_libur: current.filter(d => d !== day) };
      } else {
        return { ...prev, hari_libur: [...current, day] };
      }
    });
  };

  const validateForm = () => {
    if (!formData.nama_toko) return 'Nama toko wajib diisi';
    if (!formData.alamat_toko) return 'Alamat toko wajib diisi';
    if (!formData.kota) return 'Kota wajib diisi';
    if (!formData.provinsi) return 'Provinsi wajib diisi';
    if (!formData.kode_pos) return 'Kode pos wajib diisi';
    
    const phoneRegex = /^(08|\+62)[0-9]{7,13}$/;
    if (!formData.nomor_telepon || !phoneRegex.test(formData.nomor_telepon.replace(/[- ]/g, ''))) {
      return 'Format nomor telepon tidak valid (gunakan 08... atau +62...)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email_toko || !emailRegex.test(formData.email_toko)) {
      return 'Format email tidak valid';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (!tokoInfo?.id) {
      toast.error('Data toko tidak ditemukan');
      return;
    }

    setIsSaving(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'hari_libur') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (photoFile) {
        submitData.append('logo', photoFile);
      } else if (photoRemoved) {
        submitData.append('logo', '');
      }

      await updateTokoInfo(tokoInfo.id, submitData);
      toast.success('Informasi toko berhasil disimpan');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan informasi toko');
    } finally {
      setIsSaving(false);
    }
  };

  if (isContextLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border-border">
          <CardHeader className="bg-card border-b rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Informasi Dasar
            </CardTitle>
            <CardDescription>Perbarui detail informasi toko Anda yang akan ditampilkan pada struk dan laporan.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form id="toko-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nama_toko">Nama Toko <span className="text-destructive">*</span></Label>
                  <Input 
                    id="nama_toko" 
                    value={formData.nama_toko} 
                    onChange={e => setFormData({...formData, nama_toko: e.target.value})} 
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deskripsi_toko">Deskripsi Singkat</Label>
                  <Textarea 
                    id="deskripsi_toko" 
                    value={formData.deskripsi_toko} 
                    onChange={e => setFormData({...formData, deskripsi_toko: e.target.value})} 
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat_toko" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground"/> Alamat Lengkap <span className="text-destructive">*</span></Label>
                  <Input 
                    id="alamat_toko" 
                    value={formData.alamat_toko} 
                    onChange={e => setFormData({...formData, alamat_toko: e.target.value})} 
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kota">Kota <span className="text-destructive">*</span></Label>
                  <Input id="kota" value={formData.kota} onChange={e => setFormData({...formData, kota: e.target.value})} maxLength={50} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provinsi">Provinsi <span className="text-destructive">*</span></Label>
                  <Input id="provinsi" value={formData.provinsi} onChange={e => setFormData({...formData, provinsi: e.target.value})} maxLength={50} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kode_pos">Kode Pos <span className="text-destructive">*</span></Label>
                  <Input id="kode_pos" value={formData.kode_pos} onChange={e => setFormData({...formData, kode_pos: e.target.value})} maxLength={10} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomor_telepon" className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground"/> Nomor Telepon <span className="text-destructive">*</span></Label>
                  <Input id="nomor_telepon" value={formData.nomor_telepon} onChange={e => setFormData({...formData, nomor_telepon: e.target.value})} placeholder="08xxx / +62xxx" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_toko" className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground"/> Email <span className="text-destructive">*</span></Label>
                  <Input id="email_toko" type="email" value={formData.email_toko} onChange={e => setFormData({...formData, email_toko: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground"/> Website</Label>
                  <Input id="website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="jam_operasional" className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground"/> Jam Operasional</Label>
                  <Input id="jam_operasional" value={formData.jam_operasional} onChange={e => setFormData({...formData, jam_operasional: e.target.value})} placeholder="Senin - Jumat: 09:00 - 17:00" />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label>Hari Libur Operasional</Label>
                  <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/20">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${day}`} 
                          checked={(formData.hari_libur || []).includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <Label htmlFor={`day-${day}`} className="font-normal cursor-pointer">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm border-border">
          <CardHeader className="bg-card border-b rounded-t-xl">
            <CardTitle>Logo Toko</CardTitle>
            <CardDescription>Logo akan ditampilkan di header dan struk transaksi.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <LogoUploadField 
              currentLogoUrl={logoUrl}
              onFileSelect={(file) => { setPhotoFile(file); setPhotoRemoved(false); }}
              onFileRemove={() => { setPhotoFile(null); setPhotoRemoved(true); }}
              isUploading={isSaving}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col gap-3">
            <Button type="submit" form="toko-form" className="w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Simpan Informasi
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={resetForm} disabled={isSaving}>
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokoInfoTab;

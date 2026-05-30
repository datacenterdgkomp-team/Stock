
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { createUserForPegawai } from '@/lib/PegawaiAutoUserHelper.js';

const FormPegawaiModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    id_pegawai: '',
    nama_lengkap: '',
    email: '',
    nomor_telepon: '',
    alamat: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    posisi: 'Staff',
    departemen: 'Operasional',
    tanggal_bergabung: '',
    status_kerja: 'Aktif',
    gaji_pokok: '',
    tunjangan: '',
    nomor_identitas: '',
    nama_kontak_darurat: '',
    nomor_kontak_darurat: '',
    catatan: ''
  });

  const [fotoBlob, setFotoBlob] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [idPegawaiStatus, setIdPegawaiStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({
          id_pegawai: initialData.id_pegawai || '',
          nama_lengkap: initialData.nama_lengkap || '',
          email: initialData.email || '',
          nomor_telepon: initialData.nomor_telepon || '',
          alamat: initialData.alamat || '',
          tanggal_lahir: initialData.tanggal_lahir ? initialData.tanggal_lahir.split(' ')[0] : '',
          jenis_kelamin: initialData.jenis_kelamin || 'Laki-laki',
          posisi: initialData.posisi || 'Staff',
          departemen: initialData.departemen || 'Operasional',
          tanggal_bergabung: initialData.tanggal_bergabung ? initialData.tanggal_bergabung.split(' ')[0] : '',
          status_kerja: initialData.status_kerja || 'Aktif',
          gaji_pokok: initialData.gaji_pokok || '',
          tunjangan: initialData.tunjangan || '',
          nomor_identitas: initialData.nomor_identitas || '',
          nama_kontak_darurat: initialData.nama_kontak_darurat || '',
          nomor_kontak_darurat: initialData.nomor_kontak_darurat || '',
          catatan: initialData.catatan || ''
        });
        
        if (initialData.foto_profil) {
          setFotoPreview(pb.files.getUrl(initialData, initialData.foto_profil));
        } else {
          setFotoPreview(null);
        }
        setIdPegawaiStatus({ state: 'valid', message: '' });
      } else {
        // Reset form
        setFormData({
          id_pegawai: '', nama_lengkap: '', email: '', nomor_telepon: '', alamat: '', 
          tanggal_lahir: '', jenis_kelamin: 'Laki-laki', posisi: 'Staff', 
          departemen: 'Operasional', tanggal_bergabung: new Date().toISOString().split('T')[0], 
          status_kerja: 'Aktif', gaji_pokok: '', tunjangan: '', nomor_identitas: '', 
          nama_kontak_darurat: '', nomor_kontak_darurat: '', catatan: ''
        });
        setFotoPreview(null);
        setFotoBlob(null);
        setIdPegawaiStatus({ state: 'idle', message: '' });
      }
    }
  }, [isOpen, initialData, isEdit]);

  // Real-time validation for ID Pegawai
  useEffect(() => {
    if (!isOpen) return;

    const checkId = async () => {
      const val = formData.id_pegawai.trim();
      
      if (!val) {
        setIdPegawaiStatus({ state: 'error', message: 'ID Pegawai wajib diisi' });
        return;
      }
      if (val.length < 3) {
        setIdPegawaiStatus({ state: 'error', message: 'ID Pegawai minimal 3 karakter' });
        return;
      }
      if (val.length > 20) {
        setIdPegawaiStatus({ state: 'error', message: 'ID Pegawai maksimal 20 karakter' });
        return;
      }
      if (!/^[a-zA-Z0-9-]+$/.test(val)) {
        setIdPegawaiStatus({ state: 'error', message: 'ID Pegawai hanya boleh berisi huruf, angka, dan dash' });
        return;
      }

      // If editing and ID hasn't changed, it's valid
      if (isEdit && initialData && initialData.id_pegawai === val) {
        setIdPegawaiStatus({ state: 'valid', message: '' });
        return;
      }

      setIdPegawaiStatus({ state: 'checking', message: '' });
      try {
        const res = await pb.collection('pegawai').getList(1, 1, {
          filter: `id_pegawai="${val}"`,
          $autoCancel: false
        });
        
        if (res.items.length > 0) {
          setIdPegawaiStatus({ state: 'error', message: 'ID Pegawai sudah terdaftar' });
        } else {
          setIdPegawaiStatus({ state: 'valid', message: '' });
        }
      } catch (err) {
        console.error(err);
        setIdPegawaiStatus({ state: 'error', message: 'Gagal memvalidasi ID Pegawai' });
      }
    };

    const timeoutId = setTimeout(checkId, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.id_pegawai, isEdit, initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2097152) {
      toast.error('Ukuran foto maksimal 2MB');
      e.target.value = null;
      return;
    }
    
    setFotoBlob(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submit
    if (idPegawaiStatus.state !== 'valid') {
      toast.error('Silakan perbaiki ID Pegawai terlebih dahulu');
      return;
    }
    
    if (!formData.nama_lengkap || !formData.email || !formData.tanggal_bergabung) {
      toast.error('Mohon lengkapi field yang wajib diisi (*)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate unique email if new
      if (!isEdit) {
        const existingEmail = await pb.collection('pegawai').getList(1, 1, {
          filter: `email = "${formData.email}"`,
          $autoCancel: false
        });
        if (existingEmail.items.length > 0) {
          toast.error('Email sudah terdaftar pada pegawai lain');
          setIsSubmitting(false);
          return;
        }
      }

      const pbData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'id_pegawai') {
            pbData.append(key, formData[key].trim().toUpperCase());
          } else if (key === 'tanggal_lahir' || key === 'tanggal_bergabung') {
            pbData.append(key, formData[key] + ' 00:00:00.000Z');
          } else {
            pbData.append(key, formData[key]);
          }
        }
      });

      if (fotoBlob) {
        pbData.append('foto_profil', fotoBlob);
      }

      let result;
      if (isEdit) {
        result = await pb.collection('pegawai').update(initialData.id, pbData, { $autoCancel: false });
        toast.success(`Data pegawai berhasil diperbarui dengan ID: ${result.id_pegawai}`);
      } else {
        result = await pb.collection('pegawai').create(pbData, { $autoCancel: false });
        
        // Auto-create user
        const autoUser = await createUserForPegawai(result);
        if (autoUser.success && autoUser.isNew) {
          toast.success(`Pegawai berhasil ditambahkan dengan ID: ${result.id_pegawai}. Password akun: ${autoUser.password}`, {
            duration: 8000
          });
        } else if (autoUser.success && !autoUser.isNew) {
          toast.success(`Pegawai berhasil ditambahkan dengan ID: ${result.id_pegawai}. Akun user sudah ada.`);
        } else {
          toast.warning(`Pegawai berhasil ditambahkan dengan ID: ${result.id_pegawai}, tapi gagal membuat akun user otomatis`);
        }
      }

      onSuccess(result);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card text-card-foreground">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/40">
          <DialogTitle className="text-xl">{isEdit ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[65vh] px-6 py-4">
            <div className="space-y-6">
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  idPegawaiStatus.state === 'error' ? 'border-destructive bg-destructive/5' : 
                  idPegawaiStatus.state === 'valid' ? 'border-emerald-500/50 bg-emerald-500/5' : 
                  'border-border bg-muted/30'
                }`}>
                  <Label htmlFor="id_pegawai" className="text-sm font-semibold mb-2 block">
                    ID Pegawai <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="id_pegawai"
                      placeholder="Contoh: DGK-001, P001, BUDI001"
                      value={formData.id_pegawai}
                      onChange={e => handleChange('id_pegawai', e.target.value.toUpperCase())}
                      className={`font-mono text-lg py-6 ${
                        idPegawaiStatus.state === 'error' ? 'border-destructive focus-visible:ring-destructive' : 
                        idPegawaiStatus.state === 'valid' ? 'border-emerald-500 focus-visible:ring-emerald-500' : ''
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      {idPegawaiStatus.state === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                      {idPegawaiStatus.state === 'valid' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {idPegawaiStatus.state === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                  </div>
                  
                  {idPegawaiStatus.state === 'error' && (
                    <p className="text-sm font-medium text-destructive mt-2 flex items-center gap-1">
                      {idPegawaiStatus.message}
                    </p>
                  )}
                  {idPegawaiStatus.state === 'valid' && (
                    <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center gap-1">
                      ID Pegawai valid dan tersedia
                    </p>
                  )}
                </div>
              </div>
              
              <Separator />

              {/* Photo & Basic Info Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-full sm:w-1/3 space-y-3">
                  <Label>Foto Profil</Label>
                  <div className="w-32 h-32 rounded-2xl bg-muted border-2 border-dashed border-border overflow-hidden flex items-center justify-center relative group">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-sm">No Photo</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Label htmlFor="foto-upload" className="cursor-pointer text-white text-xs font-medium bg-primary px-3 py-1.5 rounded-lg">
                        Pilih Foto
                      </Label>
                    </div>
                  </div>
                  <Input id="foto-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
                  <p className="text-xs text-muted-foreground">Max 2MB (JPG, PNG, WEBP)</p>
                </div>

                <div className="w-full sm:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama_lengkap">Nama Lengkap <span className="text-destructive">*</span></Label>
                    <Input id="nama_lengkap" value={formData.nama_lengkap} onChange={e => handleChange('nama_lengkap', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                    <Input id="nomor_telepon" type="tel" value={formData.nomor_telepon} onChange={e => handleChange('nomor_telepon', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    <Input id="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={e => handleChange('tanggal_lahir', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Kelamin</Label>
                    <Select value={formData.jenis_kelamin} onValueChange={v => handleChange('jenis_kelamin', v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomor_identitas">Nomor Identitas (KTP)</Label>
                    <Input id="nomor_identitas" value={formData.nomor_identitas} onChange={e => handleChange('nomor_identitas', e.target.value)} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Employment Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight text-primary">Informasi Pekerjaan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Posisi</Label>
                    <Select value={formData.posisi} onValueChange={v => handleChange('posisi', v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih Posisi" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kasir">Kasir</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Departemen</Label>
                    <Select value={formData.departemen} onValueChange={v => handleChange('departemen', v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih Departemen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Penjualan">Penjualan</SelectItem>
                        <SelectItem value="Operasional">Operasional</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status Kerja</Label>
                    <Select value={formData.status_kerja} onValueChange={v => handleChange('status_kerja', v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Cuti">Cuti</SelectItem>
                        <SelectItem value="Resign">Resign</SelectItem>
                        <SelectItem value="Kontrak Berakhir">Kontrak Berakhir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_bergabung">Tgl Bergabung <span className="text-destructive">*</span></Label>
                    <Input id="tanggal_bergabung" type="date" value={formData.tanggal_bergabung} onChange={e => handleChange('tanggal_bergabung', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gaji_pokok">Gaji Pokok (Rp)</Label>
                    <Input id="gaji_pokok" type="number" min="0" value={formData.gaji_pokok} onChange={e => handleChange('gaji_pokok', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tunjangan">Tunjangan (Rp)</Label>
                    <Input id="tunjangan" type="number" min="0" value={formData.tunjangan} onChange={e => handleChange('tunjangan', e.target.value)} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight text-primary">Informasi Tambahan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="alamat">Alamat Domisili</Label>
                    <Textarea id="alamat" className="resize-none" value={formData.alamat} onChange={e => handleChange('alamat', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama_kontak_darurat">Nama Kontak Darurat</Label>
                    <Input id="nama_kontak_darurat" value={formData.nama_kontak_darurat} onChange={e => handleChange('nama_kontak_darurat', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomor_kontak_darurat">No. Kontak Darurat</Label>
                    <Input id="nomor_kontak_darurat" type="tel" value={formData.nomor_kontak_darurat} onChange={e => handleChange('nomor_kontak_darurat', e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="catatan">Catatan</Label>
                    <Textarea id="catatan" className="resize-none" value={formData.catatan} onChange={e => handleChange('catatan', e.target.value)} />
                  </div>
                </div>
              </div>
              
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || idPegawaiStatus.state === 'checking' || idPegawaiStatus.state === 'error'}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pegawai'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormPegawaiModal;

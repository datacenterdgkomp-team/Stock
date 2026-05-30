
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, UploadCloud } from 'lucide-react';
import {
  validateBankName,
  validateAccountNumber,
  validateAccountHolder,
  validateBankCode,
  validateQrisImage,
  validateDescription
} from '@/lib/paymentValidation.js';

const PaymentSettingsForm = ({ method, onSaved }) => {
  const { currentUser } = useAuth();
  const isReadOnly = currentUser?.role !== 'Admin' && currentUser?.role !== 'Manager';

  const [formData, setFormData] = useState({
    status: true,
    notes: '',
    bank_name: '',
    account_number: '',
    account_holder: '',
    bank_code: '',
    qris_description: ''
  });
  
  const [qrisImageFile, setQrisImageFile] = useState(null);
  const [qrisImagePreview, setQrisImagePreview] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (method) {
      setFormData({
        status: method.status !== undefined ? method.status : true,
        notes: method.notes || '',
        bank_name: method.bank_name || '',
        account_number: method.account_number || '',
        account_holder: method.account_holder || '',
        bank_code: method.bank_code || '',
        qris_description: method.qris_description || ''
      });
      
      if (method.code === 'QRIS' && method.qris_image) {
        setQrisImagePreview(pb.files.getUrl(method, method.qris_image));
      }
    }
  }, [method]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateQrisImage(file);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, qris_image: validation.error }));
        return;
      }
      setErrors(prev => ({ ...prev, qris_image: null }));
      setQrisImageFile(file);
      setQrisImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (method.code === 'TRF') {
      const bankNameVal = validateBankName(formData.bank_name);
      if (!bankNameVal.valid) newErrors.bank_name = bankNameVal.error;
      
      const accNumVal = validateAccountNumber(formData.account_number);
      if (!accNumVal.valid) newErrors.account_number = accNumVal.error;
      
      const accHolderVal = validateAccountHolder(formData.account_holder);
      if (!accHolderVal.valid) newErrors.account_holder = accHolderVal.error;
      
      const bankCodeVal = validateBankCode(formData.bank_code);
      if (!bankCodeVal.valid) newErrors.bank_code = bankCodeVal.error;
    }
    
    if (method.code === 'QRIS') {
      const descVal = validateDescription(formData.qris_description);
      if (!descVal.valid) newErrors.qris_description = descVal.error;
      
      if (!method.qris_image && !qrisImageFile) {
        newErrors.qris_image = 'Gambar QRIS wajib diunggah untuk metode QRIS';
      }
    }
    
    const notesVal = validateDescription(formData.notes);
    if (!notesVal.valid) newErrors.notes = notesVal.error;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    if (!validateForm()) {
      toast.error('Mohon periksa kembali form pengisian');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = new FormData();
      submissionData.append('status', formData.status);
      submissionData.append('notes', formData.notes);
      
      if (method.code === 'TRF') {
        submissionData.append('bank_name', formData.bank_name);
        submissionData.append('account_number', formData.account_number);
        submissionData.append('account_holder', formData.account_holder);
        submissionData.append('bank_code', formData.bank_code);
      }
      
      if (method.code === 'QRIS') {
        submissionData.append('qris_description', formData.qris_description);
        if (qrisImageFile) {
          submissionData.append('qris_image', qrisImageFile);
        }
      }

      await pb.collection('payment_methods').update(method.id, submissionData, { $autoCancel: false });
      toast.success('Pengaturan pembayaran berhasil disimpan');
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Gagal menyimpan pengaturan pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!method) return null;

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nama Metode</Label>
              <Input value={method.name} disabled className="bg-muted" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Kode</Label>
              <Input value={method.code} disabled className="bg-muted font-mono" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
            <div className="space-y-0.5">
              <Label className="text-base">Status Aktif</Label>
              <p className="text-sm text-muted-foreground">
                Tampilkan opsi pembayaran ini di halaman Kasir
              </p>
            </div>
            <Switch
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
              disabled={isReadOnly || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Biaya Admin (Rp)</Label>
            <Input value={method.admin_fee?.toLocaleString('id-ID') || '0'} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Biaya admin dikonfigurasi melalui database langsung untuk opsi default.</p>
          </div>

          {/* TRANSFER SPECIFIC FIELDS */}
          {method.code === 'TRF' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-secondary/10">
              <div className="col-span-1 md:col-span-2">
                <h3 className="font-semibold text-lg">Informasi Rekening Bank</h3>
                <p className="text-sm text-muted-foreground mb-4">Detail rekening untuk menerima transfer dana.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank_name">Nama Bank <span className="text-destructive">*</span></Label>
                <Input
                  id="bank_name"
                  placeholder="Contoh: BCA, Mandiri, BNI"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  disabled={isReadOnly || isSubmitting}
                  className={errors.bank_name ? 'border-destructive' : 'bg-background'}
                />
                {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_code">Kode Bank</Label>
                <Input
                  id="bank_code"
                  placeholder="Contoh: 014"
                  value={formData.bank_code}
                  onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
                  disabled={isReadOnly || isSubmitting}
                  className={errors.bank_code ? 'border-destructive' : 'bg-background'}
                />
                {errors.bank_code && <p className="text-xs text-destructive">{errors.bank_code}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Nomor Rekening <span className="text-destructive">*</span></Label>
                <Input
                  id="account_number"
                  placeholder="Masukkan nomor rekening"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  disabled={isReadOnly || isSubmitting}
                  className={errors.account_number ? 'border-destructive' : 'bg-background'}
                />
                {errors.account_number && <p className="text-xs text-destructive">{errors.account_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_holder">Nama Pemilik Rekening <span className="text-destructive">*</span></Label>
                <Input
                  id="account_holder"
                  placeholder="Sesuai buku tabungan"
                  value={formData.account_holder}
                  onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                  disabled={isReadOnly || isSubmitting}
                  className={errors.account_holder ? 'border-destructive' : 'bg-background'}
                />
                {errors.account_holder && <p className="text-xs text-destructive">{errors.account_holder}</p>}
              </div>
            </div>
          )}

          {/* QRIS SPECIFIC FIELDS */}
          {method.code === 'QRIS' && (
            <div className="space-y-6 p-4 border rounded-lg bg-secondary/10">
              <div>
                <h3 className="font-semibold text-lg">Informasi QRIS</h3>
                <p className="text-sm text-muted-foreground mb-4">Upload gambar barcode QRIS Anda.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gambar QRIS <span className="text-destructive">*</span></Label>
                  {!isReadOnly && (
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" className="relative cursor-pointer" disabled={isSubmitting}>
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Pilih Gambar
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleImageChange}
                          disabled={isSubmitting}
                        />
                      </Button>
                      <span className="text-xs text-muted-foreground">Maks 5MB, format PNG/JPG</span>
                    </div>
                  )}
                  {errors.qris_image && <p className="text-xs text-destructive">{errors.qris_image}</p>}
                </div>

                {qrisImagePreview && (
                  <div className="mt-4 border rounded-xl overflow-hidden bg-white w-48 h-48 flex items-center justify-center shadow-sm">
                    <img src={qrisImagePreview} alt="QRIS Preview" className="max-w-full max-h-full object-contain p-2" />
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Label htmlFor="qris_description">Deskripsi Instruksi QRIS</Label>
                  <Textarea
                    id="qris_description"
                    placeholder="Contoh: Scan menggunakan aplikasi m-banking atau e-wallet (GoPay, OVO, Dana, LinkAja)"
                    value={formData.qris_description}
                    onChange={(e) => setFormData({ ...formData, qris_description: e.target.value })}
                    disabled={isReadOnly || isSubmitting}
                    rows={3}
                    className={`resize-none bg-background ${errors.qris_description ? 'border-destructive' : ''}`}
                  />
                  {errors.qris_description && <p className="text-xs text-destructive">{errors.qris_description}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Internal (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan untuk staff/admin (tidak tampil di kasir)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isReadOnly || isSubmitting}
              rows={2}
              className={`resize-none ${errors.notes ? 'border-destructive' : ''}`}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
          </div>

          {!isReadOnly && (
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="min-w-[200px] shadow-sm">
                {isSubmitting ? 'Menyimpan...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan Pembayaran
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentSettingsForm;

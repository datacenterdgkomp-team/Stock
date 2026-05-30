
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PaymentMethodForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const { currentUser } = useAuth();
  const isReadOnly = currentUser?.role !== 'Admin' && currentUser?.role !== 'Manager';

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: true,
    admin_fee: 0,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        status: initialData.status !== undefined ? initialData.status : true,
        admin_fee: initialData.admin_fee || 0,
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Nama harus antara 3 hingga 50 karakter';
    }
    if (!formData.code || formData.code.length < 2 || formData.code.length > 10 || !/^[a-zA-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Kode harus 2-10 karakter alfanumerik';
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Deskripsi maksimal 500 karakter';
    }
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Catatan maksimal 500 karakter';
    }
    if (formData.admin_fee < 0 || formData.admin_fee > 999999) {
      newErrors.admin_fee = 'Biaya admin harus antara 0 - 999.999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    if (validate()) {
      onSubmit({
        ...formData,
        admin_fee: parseFloat(formData.admin_fee) || 0
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Metode Bayar <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isReadOnly || isSubmitting}
          placeholder="Contoh: Transfer BCA"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Kode <span className="text-destructive">*</span></Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          disabled={isReadOnly || isSubmitting}
          placeholder="Contoh: BCA"
          className={errors.code ? 'border-destructive' : ''}
        />
        {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin_fee">Biaya Admin (Rp)</Label>
        <Input
          id="admin_fee"
          type="number"
          min="0"
          value={formData.admin_fee}
          onChange={(e) => setFormData({ ...formData, admin_fee: e.target.value })}
          disabled={isReadOnly || isSubmitting}
          className={errors.admin_fee ? 'border-destructive' : ''}
        />
        {errors.admin_fee && <p className="text-xs text-destructive">{errors.admin_fee}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isReadOnly || isSubmitting}
          rows={2}
          className="resize-none"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan Internal</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isReadOnly || isSubmitting}
          rows={2}
          className="resize-none"
        />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
        <div className="space-y-0.5">
          <Label>Status Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Metode bayar {formData.status ? 'akan' : 'tidak akan'} ditampilkan di kasir
          </p>
        </div>
        <Switch
          checked={formData.status}
          onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
          disabled={isReadOnly || isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        {!isReadOnly && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Update Metode Bayar' : 'Simpan Metode Bayar')}
          </Button>
        )}
      </div>
    </form>
  );
};

export default PaymentMethodForm;

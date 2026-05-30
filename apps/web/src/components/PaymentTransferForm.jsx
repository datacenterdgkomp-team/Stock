
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PaymentTransferForm = ({ methods, totalAmount, onVerify, onCancel }) => {
  const transferMethods = methods.filter(m => m.tipe_metode === 'transfer_bank' || m.tipe_metode === 'transfer');
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [reference, setReference] = useState('');
  
  const selectedMethod = transferMethods.find(m => m.id === selectedMethodId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMethod) return;
    onVerify({
      methodId: selectedMethod.id,
      methodName: selectedMethod.nama,
      reference: reference || 'TRF-' + Date.now().toString().slice(-6),
      amountPaid: totalAmount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-small font-medium text-muted-foreground">Pilih Bank Tujuan</Label>
        <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
          <SelectTrigger className="h-9 text-body bg-background">
            <SelectValue placeholder="Pilih Bank" />
          </SelectTrigger>
          <SelectContent>
            {transferMethods.map(m => (
              <SelectItem key={m.id} value={m.id} className="text-body">
                {m.nama} {m.bank_name ? `(${m.bank_name})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMethod && (
        <div className="p-3 bg-muted/30 border rounded-md space-y-2">
          <div className="flex justify-between items-center text-body">
            <span className="text-muted-foreground">No. Rekening</span>
            <span className="font-mono font-medium">{selectedMethod.nomor_rekening || selectedMethod.account_number || '-'}</span>
          </div>
          <div className="flex justify-between items-center text-body">
            <span className="text-muted-foreground">Atas Nama</span>
            <span className="font-medium">{selectedMethod.account_holder || '-'}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t text-body">
            <span className="text-muted-foreground">Total Transfer</span>
            <span className="font-bold text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-small font-medium text-muted-foreground">Nomor Referensi (Opsional)</Label>
        <Input 
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Contoh: REF123456"
          className="h-9 text-body"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1 h-9 text-button" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={!selectedMethod} className="flex-1 h-9 text-button">
          Verifikasi Transfer
        </Button>
      </div>
    </form>
  );
};

export default PaymentTransferForm;

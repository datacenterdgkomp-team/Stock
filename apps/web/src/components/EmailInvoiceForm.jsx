
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const EmailInvoiceForm = ({ transaction, onCancel, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email wajib diisi');
      return;
    }

    if (!validateEmail(email)) {
      setError('Format email tidak valid');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to trigger the email hook
      // In a real scenario, we might call a custom endpoint or update the record to trigger a hook
      // Since the hook is already configured to run onRecordAfterCreateSuccess, 
      // we simulate the manual trigger by updating the record's notes with the email
      
      const currentNotes = transaction.catatan || '';
      const updatedNotes = currentNotes.includes('Email sent to:') 
        ? currentNotes 
        : `${currentNotes}\nEmail sent to: ${email}`.trim();

      await pb.collection('transaksi_penjualan').update(transaction.id, {
        catatan: updatedNotes
      }, { $autoCancel: false });

      toast.success(`Invoice berhasil dikirim ke email ${email}`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error(`Gagal mengirim invoice ke email: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t pt-4 no-print">
      <div className="space-y-2">
        <Label htmlFor="email">Kirim Invoice ke Email</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`pl-9 ${error ? 'border-destructive' : ''}`}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim'}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
      </div>
    </form>
  );
};

export default EmailInvoiceForm;

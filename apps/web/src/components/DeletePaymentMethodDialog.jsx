
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const DeletePaymentMethodDialog = ({ open, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;
    setLoading(true);
    try {
      await pb.collection('metode_pembayaran').delete(item.id, { $autoCancel: false });
      toast.success('Metode pembayaran berhasil dihapus');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Gagal menghapus metode pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Metode Pembayaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus metode pembayaran <strong>{item?.nama}</strong>? 
            Transaksi dengan metode ini akan tetap ada namun kehilangan referensinya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }} 
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePaymentMethodDialog;

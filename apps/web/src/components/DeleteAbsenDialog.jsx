
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { logActivity } from '@/lib/ActivityLogHelper.js';

const DeleteAbsenDialog = ({ isOpen, onClose, recordId, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await pb.collection('absen_pegawai').delete(recordId, { $autoCancel: false });
      await logActivity('Hapus Absen', 'Lainnya', `Menghapus data absen dengan ID Record: ${recordId}`, 'Sukses');
      toast.success('Data absen berhasil dihapus');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus data absen');
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isDeleting && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Absen</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data absen ini? Tindakan ini tidak dapat dibatalkan dan data akan hilang secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAbsenDialog;

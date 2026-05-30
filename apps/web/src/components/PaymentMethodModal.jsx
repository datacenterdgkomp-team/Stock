
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PaymentMethodForm from './PaymentMethodForm.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PaymentMethodModal = ({ isOpen, onClose, paymentMethod, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        updated_by: currentUser?.id
      };

      if (paymentMethod) {
        await pb.collection('payment_methods').update(paymentMethod.id, dataToSave, { $autoCancel: false });
        toast.success('Metode bayar berhasil diupdate');
      } else {
        dataToSave.created_by = currentUser?.id;
        await pb.collection('payment_methods').create(dataToSave, { $autoCancel: false });
        toast.success('Metode bayar berhasil ditambahkan');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
      // Handle unique constraint errors
      if (error.data?.data?.name?.code === 'validation_not_unique') {
        toast.error('Nama metode bayar sudah digunakan');
      } else if (error.data?.data?.code?.code === 'validation_not_unique') {
        toast.error('Kode metode bayar sudah digunakan');
      } else {
        toast.error(paymentMethod ? 'Gagal mengupdate metode bayar' : 'Gagal menambahkan metode bayar');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paymentMethod ? 'Edit Metode Bayar' : 'Tambah Metode Bayar'}
          </DialogTitle>
        </DialogHeader>
        
        <PaymentMethodForm 
          initialData={paymentMethod}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;

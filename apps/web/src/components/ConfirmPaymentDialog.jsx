
import React from 'react';
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
import { AlertTriangle } from 'lucide-react';

const ConfirmPaymentDialog = ({ isOpen, onConfirm, onCancel, paymentSummary }) => {
  if (!paymentSummary) return null;

  const formatCurrency = (amount) => {
    return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <AlertDialogTitle className="text-xl">Konfirmasi Pembayaran</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-foreground">
            Pastikan pelanggan sudah membayar sebelum memproses transaksi. Lanjutkan?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg space-y-3 my-4 border border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Harga</span>
            <span className="font-medium">{formatCurrency(paymentSummary.subtotal + paymentSummary.tax)}</span>
          </div>
          
          {paymentSummary.discount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Diskon</span>
              <span className="font-medium">- {formatCurrency(paymentSummary.discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm pt-2 border-t border-border/50">
            <span className="font-medium">Total Pembayaran</span>
            <span className="font-bold text-primary">{formatCurrency(paymentSummary.totalPrice)}</span>
          </div>
          
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Metode Pembayaran</span>
            <span className="font-medium capitalize">{paymentSummary.paymentMethod?.nama || '-'}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jumlah Dibayar</span>
            <span className="font-medium">{formatCurrency(paymentSummary.amountPaid)}</span>
          </div>
          
          <div className="flex justify-between text-sm pt-2 border-t border-border/50">
            <span className="text-muted-foreground">Kembalian</span>
            <span className={`font-bold ${paymentSummary.change > 0 ? 'text-success' : paymentSummary.change < 0 ? 'text-destructive' : 'text-primary'}`}>
              {paymentSummary.change > 0 ? formatCurrency(paymentSummary.change) : paymentSummary.change < 0 ? `- ${formatCurrency(Math.abs(paymentSummary.change))}` : 'Pas'}
            </span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Ya, Sudah Membayar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmPaymentDialog;

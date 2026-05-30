
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TransactionDetailModal = ({ open, onClose, transaction }) => {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detail Transaksi: {transaction.nomor_transaksi}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-muted/50 p-4 rounded-lg">
          <div>
            <p className="text-muted-foreground">Tanggal</p>
            <p className="font-medium">
              {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Kasir</p>
            <p className="font-medium">{transaction.expand?.kasir?.nama_lengkap || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Metode Pembayaran</p>
            <p className="font-medium">{transaction.metode_pembayaran}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Transaksi</p>
            <p className="font-medium text-primary">Rp {(transaction.total || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaction.items && transaction.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell className="text-right">Rp {(item.harga_satuan || 0).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-center">{item.qty}</TableCell>
                  <TableCell className="text-right">Rp {(item.subtotal || 0).toLocaleString('id-ID')}</TableCell>
                </TableRow>
              ))}
              {(!transaction.items || transaction.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Tidak ada data item
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;

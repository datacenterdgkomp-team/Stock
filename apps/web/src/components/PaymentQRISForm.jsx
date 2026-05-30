
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const PaymentQRISForm = ({ method, totalAmount, onVerify, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate checking payment status
    setTimeout(() => {
      setIsVerifying(false);
      onVerify({
        methodId: method.id,
        methodName: method.nama,
        reference: 'QRIS-' + Date.now().toString().slice(-6),
        amountPaid: totalAmount
      });
    }, 1500);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Dummy QR payload including merchant name and amount
  const qrPayload = `00020101021126660014ID.CO.QRIS.WWW01189360091530292723021431234567890123520458025303360540${totalAmount.toString().length}${totalAmount}5802ID5911DG KOMPUTER6008JAKARTA6105123456304${Date.now().toString().slice(-4)}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center space-y-1">
        <p className="text-body font-medium">Scan QR Code dengan e-wallet Anda</p>
        <p className="text-h3 font-bold text-primary">Rp {totalAmount.toLocaleString('id-ID')}</p>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border">
        <QRCodeSVG value={qrPayload} size={200} />
      </div>

      <div className="text-small text-muted-foreground flex items-center gap-1 font-mono">
        Waktu tersisa: <span className="font-bold text-destructive">{minutes}:{seconds.toString().padStart(2, '0')}</span>
      </div>

      <div className="flex gap-2 w-full pt-2">
        <Button type="button" variant="outline" className="flex-1 h-9 text-button" onClick={onCancel} disabled={isVerifying}>
          Batal
        </Button>
        <Button type="button" className="flex-1 h-9 text-button" onClick={handleVerify} disabled={isVerifying}>
          {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isVerifying ? 'Cek Status...' : 'Sudah Bayar'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentQRISForm;

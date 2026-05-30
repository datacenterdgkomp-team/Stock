
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Wallet, Landmark, QrCode, Info } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PaymentMethodDisplay = ({ method }) => {
  const [copied, setCopied] = useState(false);

  if (!method) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Nomor rekening disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTunai = () => (
    <Card className="payment-card-tunai overflow-hidden">
      <CardContent className="p-6 bg-card flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Pembayaran Tunai</h3>
          <p className="text-muted-foreground mt-1">Silakan terima pembayaran tunai dari pelanggan dan hitung kembalian.</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderTransfer = () => (
    <Card className="payment-card-transfer overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-blue-50/50 p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Pembayaran Transfer</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{method.bank_name || 'Bank Transfer'}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4 bg-card">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Nomor Rekening</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight font-mono">{method.account_number || '-'}</span>
                {method.account_number && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={cn("h-8 w-8 ml-2 transition-colors", copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 copy-feedback-animation" : "")}
                    onClick={() => handleCopy(method.account_number)}
                    title="Copy Rekening"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-sm font-medium text-muted-foreground mb-1">Atas Nama</p>
              <p className="text-lg font-semibold">{method.account_holder || '-'}</p>
            </div>
            
            {method.bank_code && (
              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Kode Bank</p>
                <p className="text-base font-semibold">{method.bank_code}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQRIS = () => (
    <Card className="payment-card-qris overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-purple-50/50 p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Pembayaran QRIS</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Scan untuk Membayar</p>
          </div>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center space-y-6 bg-card">
          {method.qris_image ? (
            <div className="bg-white p-4 rounded-2xl border shadow-sm max-w-[300px] w-full aspect-square flex items-center justify-center">
              <img 
                src={pb.files.getUrl(method, method.qris_image)} 
                alt="QRIS Barcode" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="bg-muted p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center max-w-[300px] w-full aspect-square">
              <QrCode className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Kode QRIS belum diunggah</p>
            </div>
          )}
          
          {method.qris_description && (
            <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-sm max-w-sm">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-muted-foreground leading-relaxed">{method.qris_description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  switch (method.code) {
    case 'TUN':
      return renderTunai();
    case 'TRF':
      return renderTransfer();
    case 'QRIS':
      return renderQRIS();
    default:
      return null;
  }
};

export default PaymentMethodDisplay;

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import PaymentSettingsForm from '@/components/PaymentSettingsForm.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Landmark, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const PaymentMethodsPage = () => {
  const [methods, setMethods] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('payment_methods').getFullList({
        $autoCancel: false
      });
      
      const mapped = {};
      records.forEach(r => {
        mapped[r.code] = r;
      });
      
      setMethods(mapped);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Gagal memuat data metode bayar');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (code) => {
    switch (code) {
      case 'TUN': return <Wallet className="w-4 h-4 mr-2" />;
      case 'TRF': return <Landmark className="w-4 h-4 mr-2" />;
      case 'QRIS': return <QrCode className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Pengaturan Metode Bayar - DG Komputer</title>
      </Helmet>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Metode Pembayaran</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Konfigurasi detail opsi pembayaran yang tersedia di sistem kasir.
        </p>
      </div>

      {loading ? (
        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="TUN" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1 bg-muted/50 rounded-xl">
            {['TUN', 'TRF', 'QRIS'].map((code) => {
              const method = methods[code];
              if (!method) return null;
              
              return (
                <TabsTrigger 
                  key={code} 
                  value={code}
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm py-2.5 rounded-lg flex items-center justify-center transition-all"
                >
                  {getIcon(code)}
                  <span className="font-medium">{method.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {['TUN', 'TRF', 'QRIS'].map((code) => {
            const method = methods[code];
            if (!method) return null;

            return (
              <TabsContent key={code} value={code} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <Card className="shadow-sm border-border overflow-hidden">
                  <CardContent className="p-0 sm:p-6">
                    <PaymentSettingsForm 
                      method={method} 
                      onSaved={fetchMethods}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};

export default PaymentMethodsPage;
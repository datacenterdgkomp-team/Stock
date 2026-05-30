
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Settings, Layers, Tags, Bookmark, CreditCard, Store, Building2, Wallet, CheckSquare } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import TokoInfoTab from '@/components/TokoInfoTab.jsx';
import KategoriBarangTab from '@/components/KategoriBarangTab.jsx';
import JenisBarangTab from '@/components/JenisBarangTab.jsx';
import MerekBarangTab from '@/components/MerekBarangTab.jsx';
import PaymentMethodsTab from '@/components/PaymentMethodsTab.jsx';
import SupplierTab from '@/components/SupplierTab.jsx';
import KategoriPengeluaranTab from '@/components/KategoriPengeluaranTab.jsx';
import KelengkapanBarangTab from '@/components/KelengkapanBarangTab.jsx';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const hasAccess = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/20 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Akses Ditolak</h2>
              <p className="text-muted-foreground mt-2">Anda tidak memiliki izin untuk mengakses halaman Pengaturan Umum. Halaman ini hanya dapat diakses oleh Admin dan Manager.</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pengaturan Umum - DG Komputer</title>
        <meta name="description" content="Pengaturan umum sistem DG Komputer" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/20 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <Settings className="w-8 h-8 text-primary" />
                  Pengaturan Umum
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  Kelola informasi toko, kategori, jenis, merek barang, metode pembayaran, supplier, kategori pengeluaran, dan kelengkapan barang.
                </p>
              </div>

              <Tabs defaultValue="toko" className="w-full">
                <TabsList className="grid w-full grid-cols-8 mb-8 bg-muted/50 p-1 rounded-xl h-auto overflow-x-auto overflow-y-hidden shrink-0 min-w-max">
                  <TabsTrigger value="toko" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <Store className="w-4 h-4 mr-2" />
                    Informasi Toko
                  </TabsTrigger>
                  <TabsTrigger value="kategori" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <Layers className="w-4 h-4 mr-2" />
                    Kategori Barang
                  </TabsTrigger>
                  <TabsTrigger value="jenis" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <Tags className="w-4 h-4 mr-2" />
                    Jenis Barang
                  </TabsTrigger>
                  <TabsTrigger value="merek" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Merek Barang
                  </TabsTrigger>
                  <TabsTrigger value="pembayaran" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Metode Pembayaran
                  </TabsTrigger>
                  <TabsTrigger value="supplier" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <Building2 className="w-4 h-4 mr-2" />
                    Supplier
                  </TabsTrigger>
                  <TabsTrigger value="kategori-pengeluaran" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <Wallet className="w-4 h-4 mr-2" />
                    Kategori Pengeluaran
                  </TabsTrigger>
                  <TabsTrigger value="kelengkapan-barang" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Kelengkapan Barang
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="toko" className="focus-visible:outline-none">
                  <TokoInfoTab />
                </TabsContent>

                <TabsContent value="kategori" className="focus-visible:outline-none">
                  <KategoriBarangTab />
                </TabsContent>

                <TabsContent value="jenis" className="focus-visible:outline-none">
                  <JenisBarangTab />
                </TabsContent>

                <TabsContent value="merek" className="focus-visible:outline-none">
                  <MerekBarangTab />
                </TabsContent>

                <TabsContent value="pembayaran" className="focus-visible:outline-none">
                  <PaymentMethodsTab />
                </TabsContent>

                <TabsContent value="supplier" className="focus-visible:outline-none">
                  <SupplierTab />
                </TabsContent>

                <TabsContent value="kategori-pengeluaran" className="focus-visible:outline-none">
                  <KategoriPengeluaranTab />
                </TabsContent>

                <TabsContent value="kelengkapan-barang" className="focus-visible:outline-none">
                  <KelengkapanBarangTab />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default SettingsPage;

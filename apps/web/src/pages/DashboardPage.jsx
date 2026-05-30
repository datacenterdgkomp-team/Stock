
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Activity, Package, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    topProducts: [],
    recentTransactions: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        // Fetch today's transactions
        const transactions = await pb.collection('transaksi_penjualan').getFullList({
          filter: `created >= "${todayStr}"`,
          sort: '-created',
          $autoCancel: false
        });

        const totalSales = transactions.reduce((acc, curr) => acc + curr.total, 0);

        // Fetch low stock products to display as an alert
        const lowStockProducts = await pb.collection('barang').getFullList({
          filter: `stok < 15`,
          sort: 'stok',
          limit: 5,
          $autoCancel: false
        });

        setStats({
          totalSales,
          totalTransactions: transactions.length,
          recentTransactions: transactions.slice(0, 5),
          topProducts: lowStockProducts
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-muted/20">
      <Helmet><title>Dashboard - DG Komputer POS</title></Helmet>
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-base max-w-prose">
          Ringkasan performa penjualan dan inventori toko Anda hari ini.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Bento Grid Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-1 shadow-lg border-none bg-primary text-primary-foreground rounded-2xl overflow-hidden relative">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <TrendingUp className="w-32 h-32 -mr-6 -mt-6" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium tracking-wide">Pendapatan Hari Ini</CardTitle>
                <DollarSign className="h-5 w-5 opacity-90" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl md:text-4xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
                  Rp {stats.totalSales.toLocaleString('id-ID')}
                </div>
                <p className="text-sm opacity-80 mt-2 font-medium">Berdasarkan {stats.totalTransactions} transaksi</p>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 shadow-sm border-border bg-card rounded-2xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">Total Transaksi</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-extrabold text-foreground" style={{ letterSpacing: '-0.02em' }}>
                  {stats.totalTransactions}
                </div>
                <p className="text-sm text-muted-foreground mt-2 font-medium">Pesanan berhasil diselesaikan</p>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-sm border-border bg-card rounded-2xl transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">Peringatan Stok</CardTitle>
                <Package className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-extrabold text-foreground" style={{ letterSpacing: '-0.02em' }}>
                  {stats.topProducts.length}
                </div>
                <p className="text-sm text-muted-foreground mt-2 font-medium">Item butuh restock segera</p>
              </CardContent>
            </Card>
          </div>

          {/* 2-Column Data Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Transaksi Terakhir</CardTitle>
                    <CardDescription>Pesanan terbaru hari ini</CardDescription>
                  </div>
                  <Link to="/kasir" className="text-sm text-primary font-medium hover:underline flex items-center">
                    Kasir <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border/50">
                  {stats.recentTransactions.length > 0 ? stats.recentTransactions.map((trx) => (
                    <div key={trx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{trx.nomor_transaksi}</span>
                        <span className="text-xs text-muted-foreground font-medium">{new Date(trx.created).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-sm font-bold text-foreground">Rp {trx.total.toLocaleString('id-ID')}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold uppercase tracking-wider">
                          {trx.metode_pembayaran}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                      <Activity className="w-8 h-8 mb-3 opacity-20" />
                      <p className="text-sm font-medium">Belum ada transaksi hari ini.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Peringatan Stok Menipis</CardTitle>
                    <CardDescription>Barang dengan stok di bawah 15 unit</CardDescription>
                  </div>
                  <Link to="/barang" className="text-sm text-primary font-medium hover:underline flex items-center">
                    Inventori <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border/50">
                  {stats.topProducts.length > 0 ? stats.topProducts.map((barang) => (
                    <div key={barang.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground line-clamp-1">{barang.nama}</span>
                        <span className="text-xs text-muted-foreground font-mono">{barang.kode_barang}</span>
                      </div>
                      <div className="flex items-center ml-4 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${barang.stok <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning-foreground'}`}>
                          Sisa: {barang.stok}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                      <Package className="w-8 h-8 mb-3 opacity-20" />
                      <p className="text-sm font-medium">Semua stok barang dalam kondisi aman.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

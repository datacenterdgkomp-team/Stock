
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import TransactionDetailModal from '@/components/TransactionDetailModal.jsx';
import pb from '@/lib/pocketbaseClient';
import { Printer, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';

const RiwayatPenjualanPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const [metodeFilter, setMetodeFilter] = useState('all');
  
  // Summary
  const [totalPenjualan, setTotalPenjualan] = useState(0);
  const [jumlahTransaksi, setJumlahTransaksi] = useState(0);

  useEffect(() => {
    loadItems();
  }, [metodeFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const options = {
        sort: '-tanggal',
        expand: 'kasir',
        $autoCancel: false,
      };
      
      if (metodeFilter !== 'all') {
        options.filter = `metode_pembayaran = "${metodeFilter}"`;
      }

      const records = await pb.collection('transaksi_penjualan').getList(1, 100, options);
      setItems(records.items);

      // Kalkulasi Summary
      const allMatches = await pb.collection('transaksi_penjualan').getFullList(options);
      setJumlahTransaksi(allMatches.length);
      setTotalPenjualan(allMatches.reduce((sum, item) => sum + (item.total || 0), 0));

    } catch (error) {
      toast.error('Gagal memuat riwayat penjualan');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Riwayat Penjualan - DG Komputer</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 bg-secondary/20">
            <div className="print-section">
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Riwayat Penjualan</h1>
                  <p className="text-muted-foreground no-print">Laporan semua transaksi toko</p>
                </div>
                <Button onClick={handlePrint} className="no-print">
                  <Printer className="w-4 h-4 mr-2" /> Cetak Laporan
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-primary/5 border-none shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Penjualan</p>
                    <p className="text-2xl font-bold text-primary">Rp {totalPenjualan.toLocaleString('id-ID')}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card shadow-sm border-none">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Jumlah Transaksi</p>
                    <p className="text-2xl font-bold">{jumlahTransaksi}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card shadow-sm border-none">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Rata-rata Transaksi</p>
                    <p className="text-2xl font-bold">Rp {(jumlahTransaksi > 0 ? totalPenjualan / jumlahTransaksi : 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader className="no-print">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <CardTitle>Data Transaksi</CardTitle>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <Select value={metodeFilter} onValueChange={setMetodeFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Metode Pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Metode</SelectItem>
                          <SelectItem value="Tunai">Tunai</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                          <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8 no-print">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nomor Transaksi</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Kasir</TableHead>
                            <TableHead>Metode</TableHead>
                            <TableHead className="text-right">Total Transaksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map(item => (
                            <TableRow 
                              key={item.id} 
                              className="hover:bg-muted/30 cursor-pointer no-print transition-colors"
                              onClick={() => setSelectedTransaction(item)}
                            >
                              <TableCell className="font-medium text-primary">{item.nomor_transaksi}</TableCell>
                              <TableCell>
                                {new Date(item.tanggal).toLocaleDateString('id-ID', { 
                                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' 
                                })}
                              </TableCell>
                              <TableCell>{item.expand?.kasir?.nama_lengkap || 'Unknown'}</TableCell>
                              <TableCell>{item.metode_pembayaran}</TableCell>
                              <TableCell className="text-right font-medium">Rp {(item.total || 0).toLocaleString('id-ID')}</TableCell>
                            </TableRow>
                          ))}
                          {items.map(item => (
                            <TableRow key={item.id + '-print'} className="hidden print-table-row" style={{ display: 'none' }}>
                               {/* Purely structured for print view via CSS logic if needed, but standard print is enough */}
                            </TableRow>
                          ))}
                          {items.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                Tidak ada data transaksi.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        <Footer />
      </div>

      <TransactionDetailModal
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default RiwayatPenjualanPage;

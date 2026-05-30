
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const ExportExcel = ({ data, dateRange }) => {
  const handleExport = () => {
    try {
      const { pemasukan, pengeluaran, summary } = data;
      
      const wb = XLSX.utils.book_new();

      // 1. Ringkasan Keuangan
      const summaryData = [
        ['REKAP KEUANGAN DG KOMPUTER'],
        [`Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`],
        [],
        ['METRIK', 'NILAI'],
        ['Total Pemasukan', summary.totalPemasukan],
        ['Total Pengeluaran', summary.totalPengeluaran],
        ['Laba Bersih', summary.labaBersih],
        ['Jumlah Transaksi', summary.jumlahTransaksi],
        ['Jumlah Pengeluaran', summary.jumlahPengeluaran]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Keuangan');

      // 2. Detail Pemasukan
      const pemasukanData = pemasukan.map(item => ({
        'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
        'Nomor Transaksi': item.nomor_transaksi,
        'Kasir': item.expand?.kasir?.nama_lengkap || 'Unknown',
        'Metode Pembayaran': item.metode_pembayaran,
        'Total (Rp)': item.total
      }));
      const wsPemasukan = XLSX.utils.json_to_sheet(pemasukanData);
      XLSX.utils.book_append_sheet(wb, wsPemasukan, 'Detail Pemasukan');

      // 3. Detail Pengeluaran
      const pengeluaranData = pengeluaran.map(item => ({
        'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
        'Nomor Pengeluaran': item.nomor_pengeluaran,
        'Kategori': item.kategori_pengeluaran,
        'Deskripsi': item.deskripsi,
        'Jumlah (Rp)': item.jumlah,
        'Keterangan': item.keterangan || '-'
      }));
      const wsPengeluaran = XLSX.utils.json_to_sheet(pengeluaranData);
      XLSX.utils.book_append_sheet(wb, wsPengeluaran, 'Detail Pengeluaran');

      // 4. Analisis Kategori
      const kategoriMap = pengeluaran.reduce((acc, curr) => {
        acc[curr.kategori_pengeluaran] = (acc[curr.kategori_pengeluaran] || 0) + curr.jumlah;
        return acc;
      }, {});
      
      const analisisData = Object.entries(kategoriMap).map(([kategori, total]) => ({
        'Kategori': kategori,
        'Total Pengeluaran (Rp)': total
      }));
      
      const wsAnalisis = XLSX.utils.json_to_sheet(analisisData);
      XLSX.utils.book_append_sheet(wb, wsAnalisis, 'Analisis Kategori');

      // Export
      const fileName = `Rekap_Keuangan_DG_Komputer_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('File Excel berhasil diunduh');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Gagal mengekspor Excel');
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className="border-green-600 text-green-600 hover:bg-green-50">
      <FileSpreadsheet className="w-4 h-4 mr-2" />
      Export Excel
    </Button>
  );
};

export default ExportExcel;

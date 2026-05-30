
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ExcelDownloadButton = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch all barang up to 500 items
      const records = await pb.collection('barang').getList(1, 500, {
        expand: 'kategori,jenis,merek',
        sort: '-created',
        $autoCancel: false
      });

      if (records.items.length === 0) {
        toast.error('Tidak ada data barang untuk diunduh');
        setIsDownloading(false);
        return;
      }

      // Map data to match requested Excel columns
      const excelData = records.items.map((item, index) => ({
        'No.': index + 1,
        'Kode Barang': item.kode_barang || '-',
        'Nama Barang': item.nama || '-',
        'Kategori': item.expand?.kategori?.nama || '-',
        'Jenis': item.expand?.jenis?.nama || '-',
        'Merek': item.expand?.merek?.nama || '-',
        'Harga Beli': item.harga_beli || 0,
        'Harga Jual': item.harga_jual || 0,
        'Stok': item.stok || 0,
        'Satuan': item.satuan || 'Pcs',
        'Deskripsi': item.deskripsi || '-',
        'Status': item.status || 'aktif',
        'Tanggal Dibuat': new Date(item.created).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      const wscols = [
        { wch: 5 },  // No.
        { wch: 15 }, // Kode Barang
        { wch: 30 }, // Nama Barang
        { wch: 15 }, // Kategori
        { wch: 15 }, // Jenis
        { wch: 15 }, // Merek
        { wch: 15 }, // Harga Beli
        { wch: 15 }, // Harga Jual
        { wch: 8 },  // Stok
        { wch: 10 }, // Satuan
        { wch: 40 }, // Deskripsi
        { wch: 10 }, // Status
        { wch: 15 }  // Tanggal Dibuat
      ];
      worksheet['!cols'] = wscols;

      // Add basic styling properties (applied in compatible spreadsheet readers)
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2563EB" } }, // Blue background
          alignment: { horizontal: "center" }
        };
      }

      // Freeze header row
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Barang');

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Data_Barang_[${dateStr}].xlsx`;

      XLSX.writeFile(workbook, fileName);
      toast.success('Data barang berhasil diunduh');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Gagal mengunduh data barang');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDownload} 
      disabled={isDownloading}
      className="shadow-sm bg-background"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2 text-primary" />
      )}
      Download Excel
    </Button>
  );
};

export default ExcelDownloadButton;

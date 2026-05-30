
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const ExcelTemplateDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const templateData = [
        {
          'No.': 1,
          'Kode Barang': 'BRG-001',
          'Nama Barang': 'Laptop ASUS ROG',
          'Kategori': 'Komputer',
          'Jenis': 'Laptop',
          'Merek': 'ASUS',
          'Harga Beli': 15000000,
          'Harga Jual': 17500000,
          'Stok': 10,
          'Satuan': 'Unit',
          'Deskripsi': 'Laptop gaming performa tinggi',
          'Status': 'aktif'
        },
        {
          'No.': 2,
          'Kode Barang': 'BRG-002',
          'Nama Barang': 'Mouse Logitech Wireless',
          'Kategori': 'Aksesoris',
          'Jenis': 'Mouse',
          'Merek': 'Logitech',
          'Harga Beli': 150000,
          'Harga Jual': 250000,
          'Stok': 50,
          'Satuan': 'Pcs',
          'Deskripsi': 'Mouse nirkabel dengan baterai tahan lama',
          'Status': 'aktif'
        },
        {
          'No.': 3,
          'Kode Barang': 'BRG-003',
          'Nama Barang': 'Monitor Samsung 24 Inch',
          'Kategori': 'Komputer',
          'Jenis': 'Monitor',
          'Merek': 'Samsung',
          'Harga Beli': 1200000,
          'Harga Jual': 1500000,
          'Stok': 20,
          'Satuan': 'Unit',
          'Deskripsi': 'Monitor IPS Full HD',
          'Status': 'aktif'
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      const wscols = [
        { wch: 5 },  // No.
        { wch: 15 }, // Kode Barang
        { wch: 30 }, // Nama Barang
        { wch: 15 }, // Kategori
        { wch: 15 }, // Jenis
        { wch: 15 }, // Merek
        { wch: 15 }, // Harga Beli
        { wch: 15 }, // Harga Jual
        { wch: 10 }, // Stok
        { wch: 10 }, // Satuan
        { wch: 40 }, // Deskripsi
        { wch: 10 }  // Status
      ];
      worksheet['!cols'] = wscols;

      // Apply bold styling to header row (Note: fully supported in SheetJS Pro, basic structure added for compatibility)
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "0000FF" } }
        };
      }

      // Freeze header row
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Barang');

      XLSX.writeFile(workbook, 'Template_Barang.xlsx');
      toast.success('Template Excel berhasil diunduh');
    } catch (error) {
      console.error('Download template error:', error);
      toast.error('Gagal mengunduh template Excel');
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
        <FileSpreadsheet className="w-4 h-4 mr-2 text-primary" />
      )}
      Download Template
    </Button>
  );
};

export default ExcelTemplateDownload;

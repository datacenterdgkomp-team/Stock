
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const ExportPDF = ({ data, dateRange, settings }) => {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef(null);

  const handleExport = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rekap_Keuangan_DG_Komputer_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF berhasil diunduh');
      setOpen(false);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Gagal mengekspor PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="border-red-500 text-red-600 hover:bg-red-50">
        <FileText className="w-4 h-4 mr-2" />
        Preview & Export PDF
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Laporan PDF</DialogTitle>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-lg overflow-x-auto">
            <div 
              ref={printRef} 
              className="bg-white p-10 min-w-[800px] text-black"
              style={{ fontFamily: 'sans-serif' }}
            >
              {/* Kop Surat */}
              <div className="border-b-2 border-primary pb-4 mb-6 text-center">
                <h1 className="text-3xl font-bold text-primary mb-1">DG KOMPUTER</h1>
                <p className="text-sm text-gray-600">{settings?.alamat || 'Jl. Teknologi No. 123, Jakarta'}</p>
                <p className="text-sm text-gray-600">Telp: {settings?.telepon || '(021) 1234-5678'} | Email: {settings?.email || 'info@dgkomputer.com'}</p>
              </div>

              {/* Judul Laporan */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold uppercase underline mb-2">Rekapitulasi Keuangan</h2>
                <p className="text-sm">
                  Periode: {dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString('id-ID') : '-'} s/d {dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="border border-gray-200 p-4 rounded-lg bg-blue-50">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Total Pemasukan</p>
                  <p className="text-lg font-bold text-primary">Rp {data.summary.totalPemasukan.toLocaleString('id-ID')}</p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg bg-red-50">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Total Pengeluaran</p>
                  <p className="text-lg font-bold text-red-600">Rp {data.summary.totalPengeluaran.toLocaleString('id-ID')}</p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg bg-green-50">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Laba Bersih</p>
                  <p className="text-lg font-bold text-green-600">Rp {data.summary.labaBersih.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Tabel Pengeluaran Summary by Kategori */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-3 border-l-4 border-primary pl-2">Rekapitulasi Pengeluaran per Kategori</h3>
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="border border-gray-300 py-2 px-3 text-left">Kategori</th>
                      <th className="border border-gray-300 py-2 px-3 text-right">Total (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.pengeluaran.reduce((acc, curr) => {
                      acc[curr.kategori_pengeluaran] = (acc[curr.kategori_pengeluaran] || 0) + curr.jumlah;
                      return acc;
                    }, {})).map(([kategori, total], idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 py-2 px-3">{kategori}</td>
                        <td className="border border-gray-300 py-2 px-3 text-right">{total.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    {data.pengeluaran.length === 0 && (
                      <tr><td colSpan={2} className="border border-gray-300 py-4 text-center text-gray-500">Belum ada data pengeluaran</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan */}
              <div className="mt-16 flex justify-end">
                <div className="text-center">
                  <p className="text-sm mb-16">Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
                  <p className="font-bold underline">Manager Keuangan</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
              Batal
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Mengekspor...' : 'Unduh PDF'}
              <Printer className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportPDF;

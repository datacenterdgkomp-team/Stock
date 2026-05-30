
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, Printer, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const ActivityLogExport = ({ data, settings }) => {
  const [openPdf, setOpenPdf] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef(null);

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Histori_Pengguna_DG_Komputer_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF berhasil diunduh');
      setOpenPdf(false);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Gagal mengekspor PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Ringkasan
      const summaryData = [
        ['LAPORAN HISTORI PENGGUNA'],
        [`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`],
        [],
        ['Total Data', data.length],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      // Sheet 2: Detail
      const detailData = data.map(item => ({
        'Waktu': new Date(item.timestamp).toLocaleString('id-ID'),
        'Pengguna': item.username,
        'Modul': item.modul,
        'Aktivitas': item.tipe_aktivitas,
        'Deskripsi': item.deskripsi,
        'IP Address': item.ip_address,
        'Status': item.status
      }));
      const wsDetail = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Histori Lengkap');

      const fileName = `Histori_Pengguna_DG_Komputer_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('File Excel berhasil diunduh');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Gagal mengekspor Excel');
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setOpenPdf(true)} className="border-red-500 text-red-600 hover:bg-red-50">
        <FileText className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
      <Button variant="outline" onClick={handleExportExcel} className="border-green-600 text-green-600 hover:bg-green-50">
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Export Excel
      </Button>

      <Dialog open={openPdf} onOpenChange={setOpenPdf}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Laporan PDF</DialogTitle>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-lg overflow-x-auto">
            <div ref={printRef} className="bg-white p-10 min-w-[800px] text-black font-sans">
              <div className="border-b-2 border-primary pb-4 mb-6 text-center">
                <h1 className="text-3xl font-bold text-primary mb-1">{settings?.nama_toko || 'DG KOMPUTER'}</h1>
                <p className="text-sm text-gray-600">{settings?.alamat || 'Jakarta'}</p>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-xl font-bold uppercase underline mb-2">LAPORAN HISTORI PENGGUNA</h2>
                <p className="text-sm">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
              </div>

              <table className="w-full border-collapse border border-gray-300 text-sm mb-8">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 py-2 px-2 text-left">Waktu</th>
                    <th className="border border-gray-300 py-2 px-2 text-left">Pengguna</th>
                    <th className="border border-gray-300 py-2 px-2 text-left">Modul</th>
                    <th className="border border-gray-300 py-2 px-2 text-left">Aktivitas</th>
                    <th className="border border-gray-300 py-2 px-2 text-left">Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 py-1 px-2">{new Date(item.timestamp).toLocaleString('id-ID')}</td>
                      <td className="border border-gray-300 py-1 px-2">{item.username}</td>
                      <td className="border border-gray-300 py-1 px-2">{item.modul}</td>
                      <td className="border border-gray-300 py-1 px-2">{item.tipe_aktivitas}</td>
                      <td className="border border-gray-300 py-1 px-2">{item.deskripsi}</td>
                    </tr>
                  ))}
                  {data.length > 50 && (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 py-2 text-center text-gray-500 italic">
                        Menampilkan 50 data terbaru dari total {data.length} data.
                      </td>
                    </tr>
                  )}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 py-4 text-center text-gray-500">
                        Tidak ada histori
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPdf(false)} disabled={isExporting}>Batal</Button>
            <Button onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? 'Mengekspor...' : 'Unduh PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityLogExport;

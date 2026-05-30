
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import InvoicePreview from './InvoicePreview.jsx';
import EmailInvoiceForm from './EmailInvoiceForm.jsx';
import { toast } from 'sonner';

const InvoicePrintModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  storeSettings, 
  paymentMethod 
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!transaction) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('invoice-preview');
      if (!element) throw new Error('Invoice element not found');

      // Temporarily adjust styles for better PDF capture
      const originalMaxWidth = element.style.maxWidth;
      element.style.maxWidth = '80mm';
      element.style.padding = '10px';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      element.style.maxWidth = originalMaxWidth;
      element.style.padding = '';

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions based on thermal receipt ratio (80mm width)
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const dateStr = new Date(transaction.tanggal).toISOString().split('T')[0];
      pdf.save(`Invoice_${transaction.nomor_transaksi}_${dateStr}.pdf`);
      
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal menghasilkan PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto p-0 print-section bg-muted/20">
        <div className="p-4 md:p-6 no-print bg-card border-b sticky top-0 z-10 flex justify-between items-center">
          <DialogTitle className="text-lg font-bold">Preview Invoice</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 md:p-6 flex justify-center bg-muted/20">
          <InvoicePreview 
            transaction={transaction} 
            storeSettings={storeSettings} 
            paymentMethod={paymentMethod} 
          />
        </div>

        <div className="p-4 md:p-6 bg-card border-t sticky bottom-0 z-10 no-print space-y-4">
          {showEmailForm ? (
            <EmailInvoiceForm 
              transaction={transaction}
              onCancel={() => setShowEmailForm(false)}
              onSuccess={() => {
                setShowEmailForm(false);
                setTimeout(onClose, 1500);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowEmailForm(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? 'Memproses...' : 'PDF'}
              </Button>
              <Button 
                className="w-full" 
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePrintModal;

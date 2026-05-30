
import React from 'react';
import pb from '@/lib/pocketbaseClient';

const InvoicePreview = ({ transaction, storeSettings, paymentMethod }) => {
  if (!transaction) return null;

  const isTransfer = transaction.metode_pembayaran?.toLowerCase().includes('transfer') || paymentMethod?.code === 'TRF' || paymentMethod?.tipe_metode === 'transfer_bank';
  const isQRIS = transaction.metode_pembayaran?.toLowerCase().includes('qris') || paymentMethod?.code === 'QRIS' || paymentMethod?.tipe_metode === 'qris';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
  };

  const subtotal = transaction.total - (transaction.pajak || 0) - (transaction.admin_fee || 0);

  // Handle logo URL with cache busting
  let logoUrl = null;
  if (storeSettings?.logo_path) {
    const cacheBuster = storeSettings.logo_uploaded_at 
      ? new Date(storeSettings.logo_uploaded_at).getTime() 
      : Date.now();
    
    if (storeSettings.logo_path.startsWith('data:')) {
      logoUrl = storeSettings.logo_path;
    } else {
      logoUrl = `${storeSettings.logo_path}?v=${cacheBuster}`;
    }
  }

  return (
    <div id="invoice-preview" className="invoice-container bg-white text-black p-4 sm:p-6 mx-auto shadow-sm border rounded-md print:shadow-none print:border-none print:p-0">
      {/* Header */}
      <div className="text-center mb-4 flex flex-col items-center">
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo Toko" 
            className="w-16 h-16 md:w-20 md:h-20 object-contain mb-2 print:w-16 print:h-16"
          />
        )}
        <h2 className="text-xl font-bold uppercase tracking-wider mb-1">
          {storeSettings?.nama_toko || 'DG KOMPUTER'}
        </h2>
        <p className="text-xs whitespace-pre-wrap">
          {storeSettings?.alamat || 'Jl. Teknologi No. 123'}
        </p>
        <p className="text-xs">
          Telp: {storeSettings?.telepon || '(021) 1234-5678'}
        </p>
      </div>

      <div className="invoice-separator"></div>

      {/* Transaction Info */}
      <div className="text-xs space-y-1 mb-4">
        <div className="flex justify-between">
          <span>No:</span>
          <span className="font-bold">{transaction.nomor_transaksi}</span>
        </div>
        <div className="flex justify-between">
          <span>Tgl:</span>
          <span>{formatDate(transaction.tanggal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{transaction.expand?.kasir?.nama_lengkap || 'Admin'}</span>
        </div>
      </div>

      <div className="invoice-separator"></div>

      {/* Items */}
      <div className="text-xs mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dashed border-black">
              <th className="text-left py-1 font-normal">Item</th>
              <th className="text-right py-1 font-normal">Qty</th>
              <th className="text-right py-1 font-normal">Harga</th>
              <th className="text-right py-1 font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items?.map((item, index) => (
              <tr key={index}>
                <td className="py-1 pr-2 align-top">{item.nama}</td>
                <td className="text-right py-1 align-top">{item.qty}</td>
                <td className="text-right py-1 align-top">{Number(item.harga_satuan).toLocaleString('id-ID')}</td>
                <td className="text-right py-1 align-top">{Number(item.subtotal).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-separator"></div>

      {/* Totals */}
      <div className="text-xs space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {(transaction.pajak > 0) && (
          <div className="flex justify-between">
            <span>Pajak:</span>
            <span>{formatCurrency(transaction.pajak)}</span>
          </div>
        )}
        {(transaction.admin_fee > 0) && (
          <div className="flex justify-between">
            <span>Biaya Admin:</span>
            <span>{formatCurrency(transaction.admin_fee)}</span>
          </div>
        )}
        <div className="invoice-separator-solid"></div>
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
        
        <div className="flex justify-between mt-2">
          <span>Metode:</span>
          <span className="font-bold uppercase">{transaction.metode_pembayaran}</span>
        </div>
        
        {transaction.change !== undefined && transaction.change >= 0 && !isTransfer && !isQRIS && (
          <div className="flex justify-between">
            <span>Kembalian:</span>
            <span>{formatCurrency(transaction.change)}</span>
          </div>
        )}
      </div>

      {/* Conditional Payment Details */}
      {isTransfer && paymentMethod && (
        <>
          <div className="invoice-separator"></div>
          <div className="text-xs border border-black p-2 my-4 text-center">
            <p className="font-bold mb-1">DETAIL TRANSFER</p>
            <p className="uppercase">{paymentMethod.bank_name || paymentMethod.nama}</p>
            {paymentMethod.account_number && <p className="font-bold text-sm my-1">{paymentMethod.account_number}</p>}
            {paymentMethod.account_holder && <p>a/n {paymentMethod.account_holder}</p>}
            {paymentMethod.bank_code && <p>Kode Bank: {paymentMethod.bank_code}</p>}
          </div>
        </>
      )}

      {isQRIS && paymentMethod && (
        <>
          <div className="invoice-separator"></div>
          <div className="text-xs border border-black p-2 my-4 text-center flex flex-col items-center">
            <p className="font-bold mb-2">SCAN QRIS</p>
            {paymentMethod.qris_image ? (
              <img 
                src={pb.files.getUrl(paymentMethod, paymentMethod.qris_image)} 
                alt="QRIS" 
                className="invoice-qris-img mb-2"
              />
            ) : (
              <div className="w-24 h-24 border border-dashed border-black flex items-center justify-center mb-2 mx-auto">
                <span>No QRIS</span>
              </div>
            )}
            {paymentMethod.qris_description && (
              <p className="mt-1 text-[10px]">{paymentMethod.qris_description}</p>
            )}
          </div>
        </>
      )}

      <div className="invoice-separator"></div>

      {/* Footer */}
      <div className="text-center text-xs mt-4">
        <p>Terima kasih atas kunjungan Anda!</p>
        <p className="mt-1 text-[10px]">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali ada perjanjian.</p>
      </div>
    </div>
  );
};

export default InvoicePreview;

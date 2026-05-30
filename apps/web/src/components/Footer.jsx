
import React from 'react';
import { useTokoInfo } from '@/contexts/LogoContext.jsx';

const Footer = () => {
  const { tokoInfo } = useTokoInfo();

  const storeName = tokoInfo?.nama_toko || 'DG Komputer';
  const address = tokoInfo?.alamat_toko || 'Jl. Teknologi No. 123';
  const city = tokoInfo?.kota ? `${tokoInfo.kota}, ${tokoInfo.kode_pos || ''}` : 'Jakarta Selatan, 12345';
  const phone = tokoInfo?.nomor_telepon || '(021) 1234-5678';
  const email = tokoInfo?.email_toko || 'info@dgkomputer.com';
  const website = tokoInfo?.website || '';

  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">{storeName}</h3>
            <p className="text-sm text-secondary-foreground/80 max-w-xs">
              {tokoInfo?.deskripsi_toko || 'Sistem manajemen toko komputer terpadu untuk kasir, inventori, dan laporan penjualan.'}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Kontak</h3>
            <div className="space-y-2 text-sm text-secondary-foreground/80">
              <p>{address}</p>
              <p>{city}</p>
              <p>Telepon: {phone}</p>
              <p>Email: {email}</p>
              {website && <p>Website: {website}</p>}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Jam Operasional</h3>
            <div className="space-y-2 text-sm text-secondary-foreground/80">
              {tokoInfo?.jam_operasional ? (
                <p>{tokoInfo.jam_operasional}</p>
              ) : (
                <>
                  <p>Senin - Jumat: 09:00 - 18:00</p>
                  <p>Sabtu: 09:00 - 15:00</p>
                  <p>Minggu: Tutup</p>
                </>
              )}
              {tokoInfo?.hari_libur && tokoInfo.hari_libur.length > 0 && (
                <p className="mt-2 text-destructive/80 font-medium">Libur: {tokoInfo.hari_libur.join(', ')}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-secondary-foreground/80 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

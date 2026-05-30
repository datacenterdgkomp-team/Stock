
import { Banknote, Building2, CreditCard, Wallet, QrCode, FileText, MoreHorizontal } from 'lucide-react';

export const getPaymentMethodIcon = (tipe) => {
  switch (tipe) {
    case 'tunai':
      return Banknote;
    case 'transfer_bank':
      return Building2;
    case 'kartu_kredit':
      return CreditCard;
    case 'e_wallet':
      return Wallet;
    case 'qris':
      return QrCode;
    case 'cek':
      return FileText;
    case 'lainnya':
    default:
      return MoreHorizontal;
  }
};

export const getPaymentMethodColor = (tipe) => {
  switch (tipe) {
    case 'tunai':
      return 'text-emerald-600 bg-emerald-100';
    case 'transfer_bank':
      return 'text-blue-600 bg-blue-100';
    case 'kartu_kredit':
      return 'text-indigo-600 bg-indigo-100';
    case 'e_wallet':
      return 'text-cyan-600 bg-cyan-100';
    case 'qris':
      return 'text-purple-600 bg-purple-100';
    case 'cek':
      return 'text-amber-600 bg-amber-100';
    case 'lainnya':
    default:
      return 'text-slate-600 bg-slate-100';
  }
};

export const formatTipeMetode = (tipe) => {
  const map = {
    'tunai': 'Tunai',
    'transfer_bank': 'Transfer Bank',
    'kartu_kredit': 'Kartu Kredit',
    'e_wallet': 'E-Wallet',
    'qris': 'QRIS',
    'cek': 'Cek',
    'lainnya': 'Lainnya'
  };
  return map[tipe] || tipe;
};

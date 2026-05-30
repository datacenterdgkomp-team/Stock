
export const validateBankName = (name) => {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Nama bank harus minimal 3 karakter' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Nama bank maksimal 50 karakter' };
  }
  return { valid: true, error: null };
};

export const validateAccountNumber = (number) => {
  if (!number || number.trim().length < 8) {
    return { valid: false, error: 'Nomor rekening minimal 8 digit' };
  }
  if (number.length > 20) {
    return { valid: false, error: 'Nomor rekening maksimal 20 digit' };
  }
  if (!/^\d+$/.test(number)) {
    return { valid: false, error: 'Nomor rekening hanya boleh berisi angka' };
  }
  return { valid: true, error: null };
};

export const validateAccountHolder = (holder) => {
  if (!holder || holder.trim().length < 3) {
    return { valid: false, error: 'Nama pemilik rekening minimal 3 karakter' };
  }
  if (holder.length > 50) {
    return { valid: false, error: 'Nama pemilik rekening maksimal 50 karakter' };
  }
  return { valid: true, error: null };
};

export const validateBankCode = (code) => {
  if (code && code.length > 10) {
    return { valid: false, error: 'Kode bank maksimal 10 karakter' };
  }
  return { valid: true, error: null };
};

export const validateQrisImage = (file) => {
  if (!file) {
    return { valid: false, error: 'Gambar QRIS wajib diunggah' };
  }
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Format gambar harus PNG, JPG, atau JPEG' };
  }
  if (file.size > 5242880) { // 5MB
    return { valid: false, error: 'Ukuran gambar maksimal 5MB' };
  }
  return { valid: true, error: null };
};

export const validateDescription = (desc) => {
  if (desc && desc.length > 500) {
    return { valid: false, error: 'Deskripsi maksimal 500 karakter' };
  }
  return { valid: true, error: null };
};

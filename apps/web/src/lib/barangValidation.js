
export const validateKodeBarang = (kode) => {
  if (!kode || kode.trim() === '') {
    return { isValid: false, error: 'Kode barang wajib diisi' };
  }
  if (kode.length < 3) {
    return { isValid: false, error: 'Kode barang minimal 3 karakter' };
  }
  return { isValid: true, error: null };
};

export const validateNamaBarang = (nama) => {
  if (!nama || nama.trim() === '') {
    return { isValid: false, error: 'Nama barang wajib diisi' };
  }
  if (nama.length < 3) {
    return { isValid: false, error: 'Nama barang minimal 3 karakter' };
  }
  return { isValid: true, error: null };
};

export const validateHarga = (harga) => {
  const num = Number(harga);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Harga harus lebih dari 0' };
  }
  return { isValid: true, error: null };
};

export const validateStok = (stok) => {
  const num = Number(stok);
  if (isNaN(num) || num < 0) {
    return { isValid: false, error: 'Stok tidak boleh negatif' };
  }
  return { isValid: true, error: null };
};

export const validateKategori = (kategori) => {
  if (!kategori || kategori.trim() === '') {
    return { isValid: false, error: 'Kategori wajib dipilih' };
  }
  return { isValid: true, error: null };
};

export const validateJenis = (jenis) => {
  if (!jenis || jenis.trim() === '') {
    return { isValid: false, error: 'Jenis wajib dipilih' };
  }
  return { isValid: true, error: null };
};

export const validateMerek = (merek) => {
  if (!merek || merek.trim() === '') {
    return { isValid: false, error: 'Merek wajib dipilih' };
  }
  return { isValid: true, error: null };
};

export const validateSatuan = (satuan) => {
  if (!satuan || satuan.trim() === '') {
    return { isValid: false, error: 'Satuan wajib diisi' };
  }
  return { isValid: true, error: null };
};

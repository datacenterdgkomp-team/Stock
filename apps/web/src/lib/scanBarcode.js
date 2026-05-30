
import pb from '@/lib/pocketbaseClient';

/**
 * Utility function to scan and fetch product by barcode
 * @param {string} barcode - The barcode string to search for
 * @returns {Promise<Object>} - Result object with success status and data/error
 */
export const scanBarcode = async (barcode) => {
  if (!barcode || barcode.trim() === '') {
    return { success: false, error: 'empty' };
  }

  try {
    const result = await pb.collection('barang').getList(1, 1, {
      filter: `kode_barang="${barcode.trim()}"`,
      $autoCancel: false
    });

    if (result.items.length === 0) {
      return { 
        success: false, 
        error: 'not_found', 
        message: 'Barang tidak ditemukan' 
      };
    }

    const item = result.items[0];

    if (item.stok <= 0) {
      return { 
        success: false, 
        error: 'out_of_stock', 
        message: 'Stok habis', 
        item 
      };
    }

    return { 
      success: true, 
      item 
    };
  } catch (error) {
    console.error('Scan barcode error:', error);
    return { 
      success: false, 
      error: 'network_error', 
      message: 'Gagal memproses scan, coba lagi' 
    };
  }
};

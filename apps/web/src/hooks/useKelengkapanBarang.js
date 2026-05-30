
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export const useKelengkapanBarang = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKelengkapanBarang = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('kelengkapan_barang').getFullList({
        sort: 'nama_kelengkapan',
        expand: 'kategori',
        $autoCancel: false
      });
      return records;
    } catch (err) {
      console.error('Error fetching kelengkapan barang:', err);
      setError(err.message);
      toast.error('Gagal memuat data kelengkapan barang');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addKelengkapanBarang = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('kelengkapan_barang').create(data, { $autoCancel: false });
      toast.success('Kelengkapan barang berhasil ditambahkan');
      return record;
    } catch (err) {
      console.error('Error adding kelengkapan barang:', err);
      setError(err.message);
      toast.error(err.response?.data?.nama_kelengkapan?.message || 'Gagal menambahkan kelengkapan barang');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateKelengkapanBarang = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('kelengkapan_barang').update(id, data, { $autoCancel: false });
      toast.success('Kelengkapan barang berhasil diperbarui');
      return record;
    } catch (err) {
      console.error('Error updating kelengkapan barang:', err);
      setError(err.message);
      toast.error(err.response?.data?.nama_kelengkapan?.message || 'Gagal memperbarui kelengkapan barang');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkKelengkapanUsage = useCallback(async (id) => {
    try {
      // Since kelengkapan is stored as a JSON array of IDs in jasa_service,
      // we use the ~ (like/contains) operator to check if the ID exists in the JSON string
      const records = await pb.collection('jasa_service').getList(1, 1, {
        filter: `kelengkapan ~ "${id}"`,
        $autoCancel: false
      });
      return records.totalItems > 0;
    } catch (err) {
      console.error('Error checking kelengkapan usage:', err);
      return false;
    }
  }, []);

  const deleteKelengkapanBarang = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const isUsed = await checkKelengkapanUsage(id);
      if (isUsed) {
        throw new Error('Kelengkapan ini sedang digunakan pada data jasa service dan tidak dapat dihapus.');
      }
      
      await pb.collection('kelengkapan_barang').delete(id, { $autoCancel: false });
      toast.success('Kelengkapan barang berhasil dihapus');
      return true;
    } catch (err) {
      console.error('Error deleting kelengkapan barang:', err);
      setError(err.message);
      toast.error(err.message || 'Gagal menghapus kelengkapan barang');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkKelengkapanUsage]);

  return {
    loading,
    error,
    fetchKelengkapanBarang,
    addKelengkapanBarang,
    updateKelengkapanBarang,
    deleteKelengkapanBarang,
    checkKelengkapanUsage
  };
};


import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

export const useKodeBarangValidation = (kodeBarang, barangId = null) => {
  const [isValid, setIsValid] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!kodeBarang || kodeBarang.trim() === '') {
      setIsValid(false);
      setIsDuplicate(false);
      setError('Kode barang wajib diisi');
      return;
    }

    if (kodeBarang.length < 3) {
      setIsValid(false);
      setIsDuplicate(false);
      setError('Kode barang minimal 3 karakter');
      return;
    }

    const checkDuplicate = async () => {
      setIsLoading(true);
      try {
        let filter = `kode_barang = "${kodeBarang}"`;
        if (barangId) {
          filter += ` && id != "${barangId}"`;
        }

        const records = await pb.collection('barang').getList(1, 1, {
          filter: filter,
          $autoCancel: false
        });

        if (records.totalItems > 0) {
          setIsValid(false);
          setIsDuplicate(true);
          setError('Kode barang sudah digunakan');
        } else {
          setIsValid(true);
          setIsDuplicate(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error validating kode barang:', err);
        setIsValid(false);
        setError('Gagal memvalidasi kode barang');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkDuplicate();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [kodeBarang, barangId]);

  return { isValid, isDuplicate, isLoading, error };
};

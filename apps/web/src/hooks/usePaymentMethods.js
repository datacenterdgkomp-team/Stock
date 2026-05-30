
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await pb.collection('metode_pembayaran').getFullList({
        filter: 'status = "aktif"',
        sort: 'nama',
        $autoCancel: false
      });
      setMethods(records);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();

    pb.collection('metode_pembayaran').subscribe('*', function (e) {
      fetchMethods();
    }).catch(err => {
      console.warn('Could not subscribe to metode_pembayaran collection:', err);
    });

    return () => {
      pb.collection('metode_pembayaran').unsubscribe('*').catch(() => {});
    };
  }, [fetchMethods]);

  const getPaymentMethodById = (id) => {
    return methods.find(m => m.id === id);
  };

  return {
    methods,
    isLoading,
    error,
    refetch: fetchMethods,
    getPaymentMethodById
  };
};

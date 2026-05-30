
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export const useSystemSettings = (collectionName) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async (page = 1, perPage = 10, search = '', statusFilter = 'all', sort = '-created') => {
    setIsLoading(true);
    try {
      let filter = [];
      if (search) {
        filter.push(`(nama ~ "${search}" || deskripsi ~ "${search}")`);
      }
      if (statusFilter !== 'all') {
        filter.push(`status = "${statusFilter}"`);
      }

      const records = await pb.collection(collectionName).getList(page, perPage, {
        filter: filter.length > 0 ? filter.join(' && ') : '',
        sort: sort,
        $autoCancel: false
      });

      setItems(records.items);
      setTotalItems(records.totalItems);
      return records;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      toast.error(`Gagal memuat data ${collectionName}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  const createItem = async (data) => {
    setIsLoading(true);
    try {
      const record = await pb.collection(collectionName).create(data, { $autoCancel: false });
      toast.success('Data berhasil ditambahkan');
      return record;
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error);
      toast.error(error.response?.data?.nama?.message || 'Gagal menambahkan data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id, data) => {
    setIsLoading(true);
    try {
      const record = await pb.collection(collectionName).update(id, data, { $autoCancel: false });
      toast.success('Data berhasil diperbarui');
      return record;
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      toast.error(error.response?.data?.nama?.message || 'Gagal memperbarui data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setIsLoading(true);
    try {
      await pb.collection(collectionName).delete(id, { $autoCancel: false });
      toast.success('Data berhasil dihapus');
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      toast.error('Gagal menghapus data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    totalItems,
    isLoading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
};

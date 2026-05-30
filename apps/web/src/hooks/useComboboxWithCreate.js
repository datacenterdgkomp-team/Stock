
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export const useComboboxWithCreate = ({
  collectionName,
  minLength = 3,
  maxLength = 50,
  required = true,
  initialValue = ''
}) => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all items to ensure backward compatibility for existing values
      const records = await pb.collection(collectionName).getFullList({
        sort: 'nama',
        $autoCancel: false
      });
      setItems(records);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(`Gagal memuat data ${collectionName}`);
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  const validateNewItem = (name) => {
    if (required && (!name || name.trim() === '')) {
      return 'Nama wajib diisi';
    }
    if (name.length < minLength) {
      return `Nama minimal ${minLength} karakter`;
    }
    if (name.length > maxLength) {
      return `Nama maksimal ${maxLength} karakter`;
    }
    const isDuplicate = items.some(item => item.nama.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      return 'Nama sudah ada';
    }
    return null;
  };

  const handleCreate = async (name) => {
    const validationError = validateNewItem(name);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return null;
    }

    setIsCreating(true);
    setError(null);
    try {
      const record = await pb.collection(collectionName).create({
        nama: name,
        status: 'aktif'
      }, { $autoCancel: false });
      
      setItems(prev => [...prev, record].sort((a, b) => a.nama.localeCompare(b.nama)));
      setSelectedValue(record.id);
      setSearchQuery('');
      toast.success(`${name} berhasil ditambahkan`);
      return record;
    } catch (err) {
      console.error(`Error creating ${collectionName}:`, err);
      setError(`Gagal menambahkan ${collectionName}`);
      toast.error(`Gagal menambahkan ${collectionName}`);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showCreateOption = searchQuery.trim().length >= minLength && 
    !items.some(item => item.nama.toLowerCase() === searchQuery.trim().toLowerCase());

  // Determine if the currently selected value actually exists in the fetched items list
  const isValidSelection = isLoading || !selectedValue ? true : items.some(item => item.id === selectedValue);

  return {
    items,
    filteredItems,
    searchQuery,
    setSearchQuery,
    selectedValue,
    setSelectedValue,
    isLoading,
    isCreating,
    error,
    handleCreate,
    showCreateOption,
    isValidSelection
  };
};

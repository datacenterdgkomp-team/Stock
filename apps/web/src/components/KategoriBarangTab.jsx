
import React from 'react';
import SystemSettingTab from './SystemSettingTab.jsx';

const KategoriBarangTab = () => {
  return (
    <SystemSettingTab 
      collectionName="kategori" 
      title="Kategori Barang" 
      description="Kelompokkan barang agar mudah dicari dan difilter." 
      minLength={3} 
    />
  );
};

export default KategoriBarangTab;

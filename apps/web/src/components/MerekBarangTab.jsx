
import React from 'react';
import SystemSettingTab from './SystemSettingTab.jsx';

const MerekBarangTab = () => {
  return (
    <SystemSettingTab 
      collectionName="merek" 
      title="Merek Barang" 
      description="Kelola merek barang yang tersedia di toko." 
      minLength={2} 
    />
  );
};

export default MerekBarangTab;

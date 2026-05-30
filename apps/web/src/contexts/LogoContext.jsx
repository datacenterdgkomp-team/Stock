
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

const LogoContext = createContext(null);

export const LogoProvider = ({ children }) => {
  const [tokoInfo, setTokoInfo] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTokoInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('toko_info').getFullList({ $autoCancel: false });
      if (records.length > 0) {
        const info = records[0];
        setTokoInfo(info);
        
        if (info.logo) {
          const cacheBuster = new Date(info.updated).getTime();
          setLogoUrl(`${pb.files.getUrl(info, info.logo)}?v=${cacheBuster}`);
        } else {
          setLogoUrl(null);
        }
      }
    } catch (error) {
      console.error('Error fetching toko_info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTokoInfo = async (id, data) => {
    try {
      const updatedRecord = await pb.collection('toko_info').update(id, data, { $autoCancel: false });
      setTokoInfo(updatedRecord);
      if (updatedRecord.logo) {
        const cacheBuster = new Date(updatedRecord.updated).getTime();
        setLogoUrl(`${pb.files.getUrl(updatedRecord, updatedRecord.logo)}?v=${cacheBuster}`);
      } else {
        setLogoUrl(null);
      }
      return updatedRecord;
    } catch (error) {
      console.error('Error updating toko_info:', error);
      throw error;
    }
  };

  useEffect(() => {
    getTokoInfo();
  }, [getTokoInfo]);

  const refreshLogo = () => {
    getTokoInfo();
  };

  return (
    <LogoContext.Provider value={{ 
      tokoInfo, 
      logoUrl, 
      isLoading, 
      getTokoInfo, 
      updateTokoInfo,
      refreshLogo,
      // Backward compatibility
      storeSettings: tokoInfo 
    }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useTokoInfo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useTokoInfo must be used within a LogoProvider');
  }
  return context;
};

// Backward compatibility
export const useLogo = useTokoInfo;

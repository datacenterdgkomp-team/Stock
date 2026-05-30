
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolokasi tidak didukung oleh browser ini.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let msg = 'Gagal mendapatkan lokasi.';
        if (error.code === 1) msg = 'Izin akses lokasi ditolak. Silakan izinkan akses lokasi.';
        if (error.code === 2) msg = 'Sinyal GPS tidak tersedia.';
        if (error.code === 3) msg = 'Waktu permintaan lokasi habis.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  });
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'id'
      }
    });
    const data = await response.json();
    return data.display_name || 'Alamat tidak ditemukan';
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat}, ${lng}`;
  }
};

export const validateGPSAccuracy = (accuracy, maxAccepted = 100) => {
  // Using 100m default as 10m is often too strict for indoor/cellular GPS
  if (accuracy > maxAccepted) {
    throw new Error(`Akurasi GPS terlalu rendah (${Math.round(accuracy)}m). Pindah ke ruang terbuka untuk sinyal yang lebih baik.`);
  }
  return true;
};

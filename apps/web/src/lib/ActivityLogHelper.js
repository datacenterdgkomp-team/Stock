
import pb from '@/lib/pocketbaseClient';

export const logActivity = async (tipeAktivitas, modul, deskripsi, status = 'Sukses') => {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) return;
    
    const user = pb.authStore.model;
    let ip = 'Unknown';
    
    try {
      // Attempt to get public IP, fail silently
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      ip = data.ip;
    } catch (e) {
      // IP fetch failed, keep as 'Unknown'
    }

    const logData = {
      user_id: user.id,
      username: user.nama_lengkap || user.email || 'Unknown',
      tipe_aktivitas: tipeAktivitas,
      modul: modul,
      deskripsi: deskripsi,
      ip_address: ip,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      status: status
    };

    await pb.collection('activity_log').create(logData, { $autoCancel: false });
  } catch (error) {
    console.error('Silent failure: Could not log activity', error);
  }
};

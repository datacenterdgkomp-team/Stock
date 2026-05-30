
import pb from '@/lib/pocketbaseClient';

export const createUserForPegawai = async (pegawaiData) => {
  try {
    // Check if user already exists
    const existing = await pb.collection('users').getList(1, 1, {
      filter: `email = "${pegawaiData.email}"`,
      $autoCancel: false
    });

    if (existing.items.length > 0) {
      return { success: true, user: existing.items[0], isNew: false };
    }

    // Map pegawai posisi to system roles
    let role = 'Kasir'; // Default fallback
    if (pegawaiData.posisi === 'Manager') role = 'Manager';
    if (pegawaiData.posisi === 'Kasir') role = 'Kasir';
    if (pegawaiData.posisi === 'Admin') role = 'Admin'; // In case it's an admin

    const defaultPassword = 'Pegawai@2024';

    // Auto generate user account
    const newUser = await pb.collection('users').create({
      email: pegawaiData.email,
      password: defaultPassword,
      passwordConfirm: defaultPassword,
      nama_lengkap: pegawaiData.nama_lengkap,
      name: pegawaiData.nama_lengkap, // fallback name
      role: role,
      status: 'active',
      emailVisibility: true
    }, { $autoCancel: false });

    return { 
      success: true, 
      user: newUser, 
      isNew: true, 
      password: defaultPassword 
    };
  } catch (error) {
    console.error('Error auto-creating user:', error);
    return { success: false, error };
  }
};

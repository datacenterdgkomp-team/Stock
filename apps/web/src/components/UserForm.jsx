
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const UserForm = ({ open, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nama_lengkap: '',
    role: 'Kasir',
    status: 'active',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        passwordConfirm: '',
        nama_lengkap: user.nama_lengkap || '',
        role: user.role || 'Kasir',
        status: user.status || 'active',
      });
    } else {
      setFormData({
        email: '',
        password: '',
        passwordConfirm: '',
        nama_lengkap: '',
        role: 'Kasir',
        status: 'active',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user && formData.password !== formData.passwordConfirm) {
        toast.error('Password tidak cocok');
        setLoading(false);
        return;
      }

      const data = {
        email: formData.email,
        nama_lengkap: formData.nama_lengkap,
        role: formData.role,
        status: formData.status,
      };

      if (formData.password) {
        data.password = formData.password;
        data.passwordConfirm = formData.passwordConfirm;
      }

      if (user) {
        await pb.collection('users').update(user.id, data, { $autoCancel: false });
        toast.success('User berhasil diupdate');
      } else {
        await pb.collection('users').create(data, { $autoCancel: false });
        toast.success('User berhasil ditambahkan');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Tambah User'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-foreground"
            />
          </div>

          <div>
            <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
            <Input
              id="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              required
              className="text-foreground"
            />
          </div>

          <div>
            <Label htmlFor="password">Password {!user && '*'}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
              placeholder={user ? 'Kosongkan jika tidak ingin mengubah' : ''}
              className="text-foreground"
            />
          </div>

          <div>
            <Label htmlFor="passwordConfirm">Konfirmasi Password {!user && '*'}</Label>
            <Input
              id="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              required={!user}
              className="text-foreground"
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Kasir">Kasir</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;

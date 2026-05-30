
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package2, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) return toast.error('Password dan konfirmasi tidak cocok');
    if (password.length < 8) return toast.error('Password minimal 8 karakter');
    
    setLoading(true);
    try {
      await register({
        email,
        username,
        password,
        passwordConfirm,
        role: 'Kasir', // Default role for open registrations
        status: 'active'
      });
      toast.success('Pendaftaran berhasil, silakan masuk dengan akun Anda');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftar. Email atau username mungkin sudah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Helmet><title>Daftar - DG Komputer POS</title></Helmet>
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Package2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">DG Komputer</span>
          </div>
        </div>
        <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl overflow-hidden bg-card">
          <CardHeader className="space-y-2 pb-6 pt-8 px-8">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">Buat Akun Baru</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Lengkapi formulir di bawah ini untuk bergabung
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-medium">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="johndoe" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="h-11 bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-11 bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Minimal 8 karakter"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={8} 
                  className="h-11 bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm" className="font-medium">Konfirmasi Password</Label>
                <Input 
                  id="passwordConfirm" 
                  type="password" 
                  placeholder="Ulangi password Anda"
                  value={passwordConfirm} 
                  onChange={(e) => setPasswordConfirm(e.target.value)} 
                  required 
                  minLength={8} 
                  className="h-11 bg-background text-foreground"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold mt-2 transition-all duration-200 active:scale-[0.98]" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 py-6 bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              Sudah memiliki akun? <Link to="/login" className="text-primary font-semibold hover:underline">Masuk di sini</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

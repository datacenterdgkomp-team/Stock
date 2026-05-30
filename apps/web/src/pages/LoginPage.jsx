
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Silakan isi email dan password');
    
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login berhasil');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Helmet><title>Login - DG Komputer POS</title></Helmet>
      <div className="w-full max-w-[400px]">
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
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">Masuk ke Akun</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Masukkan email dan password untuk melanjutkan ke sistem POS
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@dgkomputer.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-11 bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-11 bg-background text-foreground"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold mt-2 transition-all duration-200 active:scale-[0.98]" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 py-6 bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              Belum memiliki akun? <Link to="/register" className="text-primary font-semibold hover:underline">Daftar di sini</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

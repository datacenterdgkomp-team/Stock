
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet';

const HomePage = () => {
  const { isAuthenticated, initialLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      navigate('/dashboard-home');
    }
  }, [isAuthenticated, initialLoading, navigate]);

  const features = [
    {
      icon: ShoppingCart,
      title: 'Sistem Kasir',
      description: 'Point of Sale yang cepat dan mudah digunakan dengan perhitungan otomatis dan berbagai metode pembayaran'
    },
    {
      icon: Package,
      title: 'Manajemen Barang',
      description: 'Kelola inventori dengan mudah, tracking stok real-time, dan sistem order barang terintegrasi'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Kontrol akses berbasis role untuk Admin, Kasir, dan Manager dengan keamanan terjamin'
    },
    {
      icon: TrendingUp,
      title: 'Laporan & Analitik',
      description: 'Dashboard lengkap dengan grafik penjualan, barang terlaris, dan statistik bisnis real-time'
    }
  ];

  if (initialLoading) {
    return null; // Return empty or simple loader to prevent flashing the home page before redirect
  }

  return (
    <>
      <Helmet>
        <title>DG Komputer - Sistem Manajemen Toko</title>
        <meta name="description" content="Sistem manajemen toko komputer terpadu untuk kasir, inventori, dan laporan penjualan" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{letterSpacing: '-0.02em'}}>
                  Sistem Manajemen Toko Komputer Terpadu
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-prose">
                  Kelola bisnis komputer Anda dengan lebih efisien. Dari kasir hingga inventori, semua dalam satu platform yang mudah digunakan.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/login">
                    <Button size="lg" className="text-base">
                      Mulai Sekarang
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-base">
                    Pelajari Lebih Lanjut
                  </Button>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1565321158988-eaa80c9b7458"
                  alt="Modern computer store interior with organized displays"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Unggulan</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Semua yang Anda butuhkan untuk mengelola toko komputer modern
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200 bg-card">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap untuk memulai?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Bergabunglah dengan DG Komputer dan tingkatkan efisiensi bisnis Anda hari ini
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-base text-primary">
                Login Sekarang
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;

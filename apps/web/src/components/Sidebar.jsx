
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, Settings,
  FileText, Wrench, RotateCcw, Shield, DollarSign, History,
  PieChart, Clock, ClipboardList, UserCircle, Database, Menu, X, LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen: controlledIsOpen, setIsOpen: controlledSetIsOpen }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const [localIsOpen, setLocalIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(localIsOpen));
  }, [localIsOpen]);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;
  const setIsOpen = controlledSetIsOpen || setLocalIsOpen;

  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Manager') {
    return null;
  }

  const menuItems = {
    Admin: [
      { path: '/dashboard-home', label: 'Home', icon: LayoutDashboard },
      { path: '/dashboard', label: 'Toko Dashboard', icon: LayoutDashboard },
      { path: '/rekap-keuangan', label: 'Rekap Keuangan', icon: PieChart },
      { path: '/activity-log', label: 'Histori Pengguna', icon: Clock },
      
      { isDivider: true, label: 'Toko' },
      { path: '/kasir', label: 'Kasir', icon: ShoppingCart },
      { path: '/barang', label: 'Manajemen Barang', icon: Package },
      { path: '/service', label: 'Jasa Service', icon: Wrench },
      { path: '/return', label: 'Return Barang', icon: RotateCcw },
      { path: '/warranty', label: 'Klaim Garansi', icon: Shield },
      { path: '/expenses', label: 'Pengeluaran', icon: DollarSign },
      { path: '/sales-history', label: 'Riwayat Penjualan', icon: History },
      
      { isDivider: true, label: 'Kepegawaian' },
      { path: '/pegawai', label: 'Data Pegawai', icon: Users },
      { path: '/absen', label: 'Absen Masuk', icon: Clock },
      { path: '/data-absen', label: 'Riwayat Absen', icon: ClipboardList },
      { path: '/laporan-absen', label: 'Laporan Absensi', icon: FileText },
      
      { isDivider: true, label: 'Sistem' },
      { path: '/users', label: 'User Management', icon: UserCircle },
      { path: '/backup-restore', label: 'Backup/Restore', icon: Database },
      { path: '/settings', label: 'Pengaturan Umum', icon: Settings },
    ],
    Manager: [
      { path: '/dashboard-home', label: 'Home', icon: LayoutDashboard },
      { path: '/dashboard', label: 'Toko Dashboard', icon: LayoutDashboard },
      { path: '/rekap-keuangan', label: 'Rekap Keuangan', icon: PieChart },
      
      { isDivider: true, label: 'Operasional' },
      { path: '/barang', label: 'Manajemen Barang', icon: Package },
      { path: '/service', label: 'Jasa Service', icon: Wrench },
      { path: '/return', label: 'Return Barang', icon: RotateCcw },
      { path: '/warranty', label: 'Klaim Garansi', icon: Shield },
      { path: '/expenses', label: 'Pengeluaran', icon: DollarSign },
      { path: '/sales-history', label: 'Riwayat Penjualan', icon: History },
      { path: '/laporan', label: 'Laporan', icon: FileText },
      
      { isDivider: true, label: 'Kepegawaian' },
      { path: '/pegawai', label: 'Data Pegawai', icon: Users },
      { path: '/absen', label: 'Absen Masuk', icon: Clock },
      { path: '/data-absen', label: 'Riwayat Absen', icon: ClipboardList },
      { path: '/laporan-absen', label: 'Laporan Absensi', icon: FileText },
      
      { isDivider: true, label: 'Sistem' },
      { path: '/backup-restore', label: 'Backup/Restore', icon: Database },
      { path: '/settings', label: 'Pengaturan Umum', icon: Settings },
    ],
  };

  const items = menuItems[currentUser?.role] || [];

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsOpen(false)}
        />
      )}

      <TooltipProvider delayDuration={100}>
        <aside 
          className={cn(
            "fixed left-0 top-0 h-screen bg-card border-r border-border z-50 flex flex-col shadow-sm sidebar-smooth-transition overflow-hidden no-print",
            isOpen 
              ? "w-sidebar-mobile md:w-sidebar-tablet lg:w-sidebar-desktop translate-x-0" 
              : "-translate-x-full md:translate-x-0 md:w-[var(--sidebar-width-collapsed-desktop)] items-center"
          )}
        >
          {/* Header / Logo Section */}
          <div className={cn(
            "flex items-center shrink-0 border-b border-border sidebar-smooth-transition",
            isOpen ? "h-12 px-3.5 justify-between" : "h-12 px-0 justify-center"
          )}>
            {isOpen && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-[13px] truncate">DG Komputer</span>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              className={cn("h-8 w-8 shrink-0", !isOpen && "mx-auto")}
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className={cn(
            "flex-1 overflow-y-auto py-3 space-y-1.5 w-full sidebar-smooth-transition", 
            isOpen ? "px-3.5" : "px-2"
          )}>
            {items.map((item, index) => {
              if (item.isDivider) {
                return (
                  <div key={`div-${index}`} className={cn("pt-3 pb-1 sidebar-smooth-transition", isOpen ? "px-2" : "px-0 flex justify-center")}>
                    {isOpen ? (
                      <p className="text-xs-10 font-semibold text-muted-foreground uppercase tracking-wider opacity-100 transition-opacity duration-300">
                        {item.label}
                      </p>
                    ) : (
                      <div className="w-6 h-px bg-border my-1 transition-all duration-300" />
                    )}
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              
              const linkContent = (
                <Link
                  to={item.path}
                  onClick={handleMenuClick}
                  className={cn(
                    "flex items-center rounded-[6px] transition-all duration-200 group relative mb-1",
                    isOpen ? "space-x-2 px-3 h-9" : "justify-center p-2 h-9 w-9 mx-auto",
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "shrink-0 transition-all duration-300", 
                    isOpen ? "w-4 h-4" : "w-4 h-4", 
                    isActive && !isOpen ? "scale-110" : "group-hover:scale-110"
                  )} />
                  
                  {isOpen && (
                    <span className="truncate opacity-100 transition-opacity duration-300 text-xs-12">
                      {item.label}
                    </span>
                  )}
                </Link>
              );

              if (!isOpen) {
                return (
                  <Tooltip key={item.path} placement="right">
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2 bg-popover text-popover-foreground shadow-md font-medium text-xs-12">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <React.Fragment key={item.path}>{linkContent}</React.Fragment>;
            })}
          </nav>

          {/* Footer Section */}
          <div className={cn(
            "shrink-0 border-t border-border sidebar-smooth-transition flex items-center",
            isOpen ? "h-12 px-3.5" : "h-12 px-0 justify-center"
          )}>
            {isOpen ? (
              <Button 
                variant="ghost" 
                className="w-full justify-start h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[6px]"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-xs-12 font-medium">Logout</span>
              </Button>
            ) : (
              <Tooltip placement="right">
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[6px]"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2 bg-popover text-popover-foreground shadow-md font-medium text-xs-12">
                  Logout
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>
      </TooltipProvider>
    </>
  );
};

export default Sidebar;

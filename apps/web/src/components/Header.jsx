
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTokoInfo } from '@/contexts/LogoContext.jsx';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu, ChevronLeft } from 'lucide-react';

const Header = ({ toggleSidebar, isOpen }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { tokoInfo, logoUrl } = useTokoInfo();

  const getInitials = (name) => {
    if (!name) return 'DG';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const storeName = tokoInfo?.nama_toko || 'DG Komputer';

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 h-14 md:h-16 transition-all duration-300">
      <div className="px-3 md:px-4 lg:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuthenticated && toggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Toggle Sidebar"
                className="w-9 h-9 md:w-10 md:h-10 hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors duration-200 touch-target"
              >
                {isOpen ? <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
              </Button>
            )}
            <Link to="/" className="flex items-center space-x-2 md:space-x-3 touch-target group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 overflow-hidden bg-primary group-hover:shadow-md hidden sm:flex">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={storeName} 
                    className="w-full h-full object-contain bg-white p-1"
                  />
                ) : (
                  <span className="text-primary-foreground font-bold text-lg md:text-xl">
                    {getInitials(storeName)}
                  </span>
                )}
              </div>
              <span className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                {storeName}
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 transition-all duration-200 hover:shadow-sm h-9 md:h-10 px-3 md:px-4 touch-target">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline text-sm md:text-base">{currentUser?.nama_lengkap || currentUser?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 md:w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm md:text-base font-medium leading-none">{currentUser?.nama_lengkap}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{currentUser?.email}</p>
                      <p className="text-xs md:text-sm text-primary font-medium mt-1">{currentUser?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer hover:bg-destructive/10 transition-colors duration-200 py-2 md:py-3">
                    <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="text-sm md:text-base">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button className="transition-all duration-200 hover:shadow-md h-9 md:h-10 px-4 md:px-6 text-sm md:text-base touch-target">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

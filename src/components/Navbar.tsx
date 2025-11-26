'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, Sparkles, Home, School, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check for logged in user
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/70 backdrop-blur-2xl shadow-lg border-b border-gray-100' 
          : 'bg-white/50 backdrop-blur-xl'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo with gradient glow */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Sparkles className="text-cyan-500 transition-transform group-hover:rotate-12 duration-300" size={28} />
                <div className="text-2xl font-bold">
                  <span className="text-foreground">Pick</span>
                  <span style={{ color: '#04d3d3' }}>MySchool</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="relative px-4 py-2 text-foreground hover:text-cyan-600 transition-colors font-medium group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home size={16} />
                Home
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/schools"
              className="relative px-4 py-2 text-foreground hover:text-cyan-600 transition-colors font-medium group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <School size={16} />
                Find Schools
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/for-schools"
              className="relative px-4 py-2 text-foreground hover:text-cyan-600 transition-colors font-medium group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Building2 size={16} />
                For Schools
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative group ml-2 px-4 py-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-xl border-gray-200">
                  <DropdownMenuItem asChild>
                    <Link href={user.role === 'student' ? '/dashboard/student' : '/dashboard/school'} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2 text-cyan-500" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="relative group overflow-hidden font-semibold"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">Login</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="relative group overflow-hidden bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button with animation */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-cyan-600" />
            ) : (
              <Menu size={24} className="text-cyan-600" />
            )}
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="container mx-auto px-4 py-6 flex flex-col space-y-3">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={20} className="text-cyan-500" />
                Home
              </Link>
              <Link
                href="/schools"
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <School size={20} className="text-cyan-500" />
                Find Schools
              </Link>
              <Link
                href="/for-schools"
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Building2 size={20} className="text-cyan-500" />
                For Schools
              </Link>
              
              <div className="pt-3 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Link
                      href={user.role === 'student' ? '/dashboard/student' : '/dashboard/school'}
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={20} className="text-cyan-500" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 transition-colors font-medium rounded-xl hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-12 font-semibold border-2 hover:border-cyan-400 hover:bg-cyan-50">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
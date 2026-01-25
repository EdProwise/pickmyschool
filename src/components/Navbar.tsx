'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, Sparkles, Home, School, Building2, GitCompare, Info, HelpCircle, Headphones, ChevronDown, LayoutGrid, ExternalLink } from 'lucide-react';
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
          ? 'bg-white/80 backdrop-blur-2xl shadow-2xl border-b border-gray-200/60' 
          : 'bg-white/60 backdrop-blur-2xl shadow-lg'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Premium gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with enhanced premium glow */}
          <Link href="/" className="flex items-center space-x-2 group relative">
            <div className="relative">
              {/* Enhanced multi-layer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/50 to-white/30 group-hover:from-white/60 group-hover:to-white/40 transition-all duration-300 border border-white/50 shadow-lg group-hover:shadow-xl">
                <div className="relative">
                  <Sparkles className="text-cyan-500 transition-all group-hover:rotate-12 group-hover:scale-110 duration-500 drop-shadow-lg w-5 h-5 sm:w-[30px] sm:h-[30px]" />
                  <div className="absolute inset-0 bg-cyan-400 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                </div>
                <div className="text-lg sm:text-2xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Pick</span>
                  <span className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">MySchool</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation with premium styling */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="relative group px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <span className="relative z-10 flex items-center gap-2 font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">
                <Home size={18} className="transition-transform group-hover:scale-110 duration-300" />
                <span className="text-sm">Home</span>
              </span>
            </Link>

            <Link
              href="/schools"
              className="relative group px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <span className="relative z-10 flex items-center gap-2 font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">
                <School size={18} className="transition-transform group-hover:scale-110 duration-300" />
                <span className="text-sm">Find Schools</span>
              </span>
            </Link>
            <Link
              href="/compare"
              className="relative group px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <span className="relative z-10 flex items-center gap-2 font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">
                <GitCompare size={18} className="transition-transform group-hover:scale-110 duration-300" />
                <span className="text-sm">Compare Schools</span>
              </span>
            </Link>
              <Link
                href="/for-schools"
                className="relative group px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                <span className="relative z-10 flex items-center gap-2 font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">
                  <Building2 size={18} className="transition-transform group-hover:scale-110 duration-300" />
                  <span className="text-sm">For Schools</span>
                </span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300 outline-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    <span className="relative z-10 flex items-center gap-2 font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">
                      <Info size={18} className="transition-transform group-hover:scale-110 duration-300" />
                      <span className="text-sm">About</span>
                      <ChevronDown size={14} className="ml-1 transition-transform group-data-[state=open]:rotate-180 duration-300" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-2xl border-gray-200/60 shadow-2xl rounded-xl p-2">
                  <DropdownMenuItem asChild>
                    <Link href="/about" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                      <Info className="h-4 w-4 mr-2.5 text-cyan-500" />
                      <span className="font-medium">About Us</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/faq" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                      <HelpCircle className="h-4 w-4 mr-2.5 text-blue-500" />
                      <span className="font-medium">FAQ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/contact-expert" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                      <Headphones className="h-4 w-4 mr-2.5 text-purple-500" />
                      <span className="font-medium">Contact Expert</span>
                    </Link>
                  </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative group px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300 outline-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      
                      <span className="relative z-10 flex items-center gap-2 font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">
                        <LayoutGrid size={18} className="transition-transform group-hover:scale-110 duration-300" />
                        <span className="text-sm">EdProwise Services</span>
                        <ChevronDown size={14} className="ml-1 transition-transform group-data-[state=open]:rotate-180 duration-300" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-2xl border-gray-200/60 shadow-2xl rounded-xl p-2">
                    <DropdownMenuItem asChild>
                      <a href="https://www.edprowise.com/services/digital-services" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                        <LayoutGrid className="h-4 w-4 mr-2.5 text-cyan-500" />
                        <span className="font-medium text-sm text-foreground">School ERP & Digital Services</span>
                        <ExternalLink size={14} className="ml-auto text-gray-400" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://www.edprowise.com/services/academic-admin-services" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                        <LayoutGrid className="h-4 w-4 mr-2.5 text-blue-500" />
                        <span className="font-medium text-sm text-foreground">Academic & Admin</span>
                        <ExternalLink size={14} className="ml-auto text-gray-400" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://orbitschool.edprowise.com/" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                        <LayoutGrid className="h-4 w-4 mr-2.5 text-purple-500" />
                        <span className="font-medium text-sm text-foreground">Orbit School - School Management</span>
                        <ExternalLink size={14} className="ml-auto text-gray-400" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://www.edprowise.com/" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                        <LayoutGrid className="h-4 w-4 mr-2.5 text-orange-500" />
                        <span className="font-medium text-sm text-foreground">Recruit & Train Teacher</span>
                        <ExternalLink size={14} className="ml-auto text-gray-400" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://www.edprowise.com/" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200">
                        <LayoutGrid className="h-4 w-4 mr-2.5 text-green-500" />
                        <span className="font-medium text-sm text-foreground">Marketing</span>
                        <ExternalLink size={14} className="ml-auto text-gray-400" />
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              
              {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative group ml-3 px-4 py-2.5 rounded-xl overflow-hidden hover:bg-transparent"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-300" />
                    
                    <div className="relative flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/50 group-hover:ring-cyan-400/50 transition-all duration-300">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">{user.name || 'User'}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-2xl border-gray-200/60 shadow-2xl rounded-xl p-2">
                  <DropdownMenuItem asChild>
                    <Link 
                      href={user.role === 'student' ? '/dashboard/student' : '/dashboard/school'} 
                      className="flex items-center cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-2.5 text-cyan-500" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200">
                    <LogOut className="h-4 w-4 mr-2.5" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="relative group overflow-hidden px-5 py-2.5 rounded-xl hover:bg-transparent font-semibold"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-300/50 rounded-xl transition-all duration-300" />
                    <span className="relative text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Login</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="relative group overflow-hidden px-6 py-2.5 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    {/* Border glow */}
                    <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300" />
                    
                    <span className="relative text-white drop-shadow-sm">Sign Up</span>
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300 max-h-[calc(100vh-64px)] overflow-y-auto">
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
                href="/compare"
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GitCompare size={20} className="text-cyan-500" />
                Compare Schools
              </Link>
                <Link
                  href="/for-schools"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building2 size={20} className="text-cyan-500" />
                  For Schools
                </Link>

                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">EdProwise Services</p>
                    <div className="space-y-1">
                      <a
                        href="https://www.edprowise.com/services/digital-services"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutGrid size={18} className="text-cyan-500" />
                        School ERP & Digital Services
                      </a>
                      <a
                        href="https://www.edprowise.com/services/academic-admin-services"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutGrid size={18} className="text-blue-500" />
                        Academic & Admin
                      </a>
                      <a
                        href="https://orbitschool.edprowise.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutGrid size={18} className="text-purple-500" />
                        Orbit School - School Management
                      </a>
                      <a
                        href="https://www.edprowise.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutGrid size={18} className="text-orange-500" />
                        Recruit & Train Teacher
                      </a>
                      <a
                        href="https://www.edprowise.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutGrid size={18} className="text-green-500" />
                        Marketing
                      </a>
                    </div>
                  </div>

                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</p>
                  <div className="space-y-1">
                    <Link
                      href="/about"
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Info size={18} className="text-cyan-500" />
                      About Us
                    </Link>
                    <Link
                      href="/faq"
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <HelpCircle size={18} className="text-blue-500" />
                      FAQ
                    </Link>
                    <Link
                      href="/contact-expert"
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-cyan-600 transition-colors font-medium rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Headphones size={18} className="text-purple-500" />
                      Contact Expert
                    </Link>
                  </div>
                </div>
              
              <div className="pt-3 border-t border-gray-200">
                {user ? (
                  <>
                      <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.name || 'User'}</p>
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
'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Support', href: '#support' },
  ];

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 ${
      isScrolled ? 'bg-dark-200/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-[240px] h-[80px]">
                <Image
                  src="/logo.png"
                  alt="Stock Track PRO Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" 
                className="text-gray-300 hover:text-white hover:bg-dark-100 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/benefits" 
                className="text-gray-300 hover:text-white hover:bg-dark-100 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Benefits
              </Link>
              <Link href="/pricing" 
                className="text-gray-300 hover:text-white hover:bg-dark-100 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Pricing
              </Link>
              <Link href="/contact" 
                className="text-gray-300 hover:text-white hover:bg-dark-100 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-200/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" 
              className="text-gray-300 hover:text-white hover:bg-dark-100 block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link href="/benefits" 
              className="text-gray-300 hover:text-white hover:bg-dark-100 block px-3 py-2 rounded-md text-base font-medium">
              Benefits
            </Link>
            <Link href="/pricing" 
              className="text-gray-300 hover:text-white hover:bg-dark-100 block px-3 py-2 rounded-md text-base font-medium">
              Pricing
            </Link>
            <Link href="/contact" 
              className="text-gray-300 hover:text-white hover:bg-dark-100 block px-3 py-2 rounded-md text-base font-medium">
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {

  return (
    <footer className="bg-black mt-auto border-t border-primary/20">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-primary font-semibold text-lg">Stock Track PRO</h3>
            <p className="text-white text-sm mt-2">
              Developed and operated by Chad Garner, trading as Garner Software.
            </p>
            <p className="text-white text-sm mt-1">
              Email: <Link href="mailto:support@stocktrackpro.co.uk" className="hover:text-primary">support@stocktrackpro.co.uk</Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/features" className="hover:text-primary">Features</Link>
            <Link href="/pricing" className="hover:text-primary">Pricing</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="https://app.stocktrackpro.co.uk" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              Dashboard Login
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-primary/20">
          <p className="text-white text-sm">
            © {new Date().getFullYear()} Stock Track PRO — Developed and operated by Chad Garner, trading as Garner Software.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <Link href="/terms" className="hover:text-primary">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-kukie-beige">
      <Header />
      <main className="flex-grow container mx-auto px-2 xxs:px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

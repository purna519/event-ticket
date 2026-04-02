import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Cursor from './Cursor';

export default function MainLayout({ children }) {
  return (
    <>
      <Cursor />
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}

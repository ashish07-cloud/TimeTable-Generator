import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors duration-500">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* This renders Home, Login, etc. */}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
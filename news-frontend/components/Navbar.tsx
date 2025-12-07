'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Newspaper, User, LogOut, PenSquare, BookmarkIcon, History, Menu, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SearchBar from '@/components/SearchBar';
import MobileSearchBar from '@/components/MobileSearchBar';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseLeave = () => {
      // Close menu when mouse leaves the navbar area
      setIsMenuOpen(false);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      // Close menu when clicking outside
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen && navbarRef.current) {
      navbarRef.current.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mousedown', handleDocumentClick);
    }

    return () => {
      if (navbarRef.current) {
        navbarRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        {/* Main navigation bar with logo, search, and menu button in one row */}
        <div className="flex items-center h-16">
          {/* Left side - Logo and primary navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600">
              <Newspaper className="w-8 h-8" />
              <span className="hidden sm:block">NewsHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Home
              </Link>
              {user && (
                <>
                  <Link href="/create-article" className="text-gray-700 hover:text-blue-600 transition font-medium flex items-center">
                    <PenSquare className="w-4 h-4 mr-1" />
                    Write
                  </Link>
                  <Link href="/my-articles" className="text-gray-700 hover:text-blue-600 transition font-medium">
                    My Articles
                  </Link>
                  <Link href="/bookmarks" className="text-gray-700 hover:text-blue-600 transition font-medium flex items-center">
                    <BookmarkIcon className="w-4 h-4 mr-1" />
                    Bookmarks
                  </Link>
                  <Link href="/history" className="text-gray-700 hover:text-blue-600 transition font-medium flex items-center">
                    <History className="w-4 h-4 mr-1" />
                    History
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Right side - User profile and mobile menu button */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="relative group hidden md:block">
                      <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none">
                        <User className="w-5 h-5" />
                        <span className="hidden lg:inline">{user.name}</span>
                      </button>

                      {/* Dropdown */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-200 z-50">
                        <Link
                          href="/my-articles"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          My Articles
                        </Link>
                        <Link
                          href="/bookmarks"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <BookmarkIcon className="w-4 h-4 mr-2" />
                          Bookmarks
                        </Link>
                        <Link
                          href="/history"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <History className="w-4 h-4 mr-2" />
                          History
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={logout}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-left"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-4">
                    <Link href="/login" className="text-gray-700 hover:text-blue-600">
                      Login
                    </Link>
                    <Link href="/register" className="btn btn-primary text-sm">
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

        {/* Mobile Search Bar - shown in the main nav bar on mobile */}
        <div className="md:hidden px-4 pb-3">
          <MobileSearchBar />
        </div>

            {/* Mobile menu button - only visible on small screens */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>


        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div ref={navbarRef} className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3 px-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/trending" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Trending
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Categories
              </Link>

              {user ? (
                <>
                  <Link href="/create-article" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                    Write Article
                  </Link>
                  <Link href="/my-articles" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                    My Articles
                  </Link>
                  <Link href="/bookmarks" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                    Bookmarks
                  </Link>
                  <Link href="/history" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                    History
                  </Link>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }} className="text-red-600 text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
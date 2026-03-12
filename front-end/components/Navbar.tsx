"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import { UserCircle, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("typingon_user");
      setUser(storedUser);
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleAuthSuccess = (username: string) => {
    setUser(username);
    localStorage.setItem("typingon_user", username);
    setIsLoginOpen(false);
    setIsSignUpOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("typingon_user");
    localStorage.removeItem("typingon_records");
    localStorage.removeItem("typingon_snippets");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <>
      <nav className="relative flex items-center justify-between px-6 py-4 bg-gray-900 shadow-md text-gray-50 sm:px-8 z-50">
        {/* LOGO SECTION */}
        <div className="text-xl font-bold tracking-wider">
          <Link href="/">
            TYPING
            <span className="bg-[linear-gradient(110deg,#3b82f6,45%,#ffffff,55%,#3b82f6)] bg-size-[200%_100%] bg-clip-text text-transparent animate-shine">
              ON
            </span>
          </Link>
        </div>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="flex items-center gap-2 group cursor-pointer hover:text-blue-400 transition"
              >
                <UserCircle className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
                <span className="font-medium text-gray-200 group-hover:text-white">
                  {user}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 font-medium transition hover:text-blue-400"
              >
                Login
              </button>
              <button
                onClick={() => setIsSignUpOpen(true)}
                className="px-6 py-2.5 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-95 whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* MOBILE OVERLAY MENU */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-gray-900 border-t border-gray-800 flex flex-col p-6 space-y-4 md:hidden">
            {user ? (
              <div className="space-y-4">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-blue-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle size={20} /> {user}
                </Link>
                <button onClick={handleLogout} className="text-gray-400">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsSignUpOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-blue-600 py-3 rounded-xl font-bold"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleAuthSuccess}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          setIsSignUpOpen(true);
        }}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignUpSuccess={handleAuthSuccess}
      />
    </>
  );
}

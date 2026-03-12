"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  onSwitchToSignUp: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToSignUp,
}: ModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed!");
      } else {
        setMessage("Login successful!");

        // 1. STORE ACCESS TOKEN AND USERNAME IN LOCAL STORAGE
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("typingon_user", data.user.username);

        // Brief delay to allow the user to see the success message before closing
        setTimeout(() => {
          onLoginSuccess(data.user.username);
          onClose();

          // Reset form fields
          setEmail("");
          setPassword("");

          // 2. FORCE PAGE RELOAD TO UPDATE NAVBAR STATE
          window.location.reload();
        }, 1000);
      }
    } catch {
      setMessage("Cannot connect to server!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-[#161616] border border-zinc-800 shadow-2xl rounded-xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute text-zinc-500 top-4 right-4 hover:text-white transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-6 text-2xl font-bold text-center text-white">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-[#0a0a0a] text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && (
            <p
              className={`text-sm font-medium text-center ${message.includes("successful") ? "text-green-400" : "text-red-400"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-2 font-bold text-white bg-[#0a0a0a] border border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 rounded-lg hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-zinc-500">
          Don&apos;t have an account?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="font-bold text-blue-400 hover:underline"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}

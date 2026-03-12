"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpSuccess: (username: string) => void;
}

export default function SignUpModal({
  isOpen,
  onClose,
  onSignUpSuccess,
}: ModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- COUNTDOWN STATE (120s = 2 minutes) ---
  const [timeLeft, setTimeLeft] = useState(120);

  // --- COUNTDOWN EFFECT ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  // ACTION 1: REGISTRATION (OR OVERWRITE UNVERIFIED ACCOUNT)
  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Email or Username already exists!");
      } else {
        setMessage("Success! Please check your email for the OTP.");
        setTimeLeft(120); // Reset timer
        setOtp(""); // Clear previous OTP input
        setStep(2); // Proceed to Verification Step
      }
    } catch {
      setMessage("Cannot connect to server!");
    } finally {
      setIsLoading(false);
    }
  };

  // ACTION 2: OTP VERIFICATION
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setMessage("OTP has expired. Please resend a new one.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.message || "Invalid or expired OTP!");
      } else {
        setMessage("Verification successful! Logging you in...");

        // BACKGROUND LOGIN AFTER SUCCESSFUL VERIFICATION
        const loginRes = await fetch("http://localhost:3001/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem("accessToken", loginData.accessToken);
          localStorage.setItem("typingon_user", username);

          setTimeout(() => {
            onSignUpSuccess(username);
            onClose();
            setStep(1);
            setUsername("");
            setEmail("");
            setPassword("");
            setOtp("");
            window.location.reload();
          }, 1000);
        } else {
          setMessage("Auto-login failed. Please log in manually.");
        }
      }
    } catch {
      setMessage("Cannot connect to server!");
    } finally {
      setIsLoading(false);
    }
  };

  // ACTION 3: RESEND OTP
  const handleResendOTP = async () => {
    await handleSignUp();
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

        {/* --- STEP 1: REGISTRATION --- */}
        {step === 1 && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-center text-white">
              Create an Account
            </h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-zinc-400">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0a0a0a] text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                    minLength={6}
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
                  className={`text-sm font-medium text-center ${message.includes("Success") ? "text-green-400" : "text-red-400"}`}
                >
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-2 font-bold text-white bg-[#0a0a0a] border border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 rounded-lg hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>
            <div className="flex items-center my-6">
              <div className="grow border-t border-zinc-800"></div>
              <span className="px-3 text-sm text-zinc-500">OR</span>
              <div className="grow border-t border-zinc-800"></div>
            </div>
            <button
              type="button"
              className="flex items-center justify-center w-full py-2 space-x-2 transition duration-200 border border-zinc-700 rounded-lg hover:bg-zinc-800 active:scale-95"
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span className="font-medium text-zinc-300">
                Continue with Google
              </span>
            </button>
          </>
        )}

        {/* --- STEP 2: OTP VERIFICATION --- */}
        {step === 2 && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="mb-2 text-2xl font-bold text-center text-white">
              Verify Your Email
            </h2>
            <p className="mb-2 text-sm text-center text-zinc-400">
              We&apos;ve sent a 6-digit code to <br />{" "}
              <span className="font-bold text-blue-400">{email}</span>
            </p>

            <div className="mb-6 h-6 flex items-center justify-center">
              {timeLeft > 0 ? (
                <span className="text-sm font-medium text-zinc-400">
                  Code expires in{" "}
                  <span className="text-red-400 font-bold ml-1">
                    {formatTime(timeLeft)}
                  </span>
                </span>
              ) : (
                <span className="text-sm font-medium text-zinc-500">
                  Code expired.{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-blue-400 font-bold hover:underline transition ml-1"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </span>
              )}
            </div>

            <form onSubmit={handleVerifyOTP} className="w-full space-y-6">
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                disabled={timeLeft === 0 || isLoading}
                className="w-full px-4 py-4 text-3xl font-bold tracking-[1em] text-center text-white bg-[#0a0a0a] border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              {message && (
                <p
                  className={`text-sm font-medium text-center ${message.includes("successful") ? "text-green-400" : "text-amber-400"}`}
                >
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading || otp.length < 6 || timeLeft === 0}
                className="w-full py-3 font-bold text-white bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 rounded-lg hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:shadow-none"
              >
                {isLoading ? "Verifying..." : "Verify Account"}
              </button>
            </form>

            <button
              onClick={() => {
                setStep(1);
                setTimeLeft(120);
              }}
              className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
            >
              Back to Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

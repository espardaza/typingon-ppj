"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

// Import the SignUpModal component
import SignUpModal from "@/components/SignUpModal";

export default function Home() {
  const [displayText, setDisplayText] = useState("");
  const fullText = "FASTER THAN CHAT GPT";

  // State to manage Modal open/close status
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Typing animation effect for the header screen
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, currentIdx + 1));
      currentIdx = (currentIdx + 1) % (fullText.length + 5);
      if (currentIdx === 0) setDisplayText("");
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  // Logic to highlight the key matching the last typed character
  const isKeyActive = (char: string) => {
    const lastChar = displayText.slice(-1).toUpperCase();
    return lastChar === char;
  };

  return (
    <div className="relative flex flex-col items-center justify-start h-full min-h-[calc(100vh-80px)] px-6 pt-5 text-center overflow-hidden bg-[#0a0a0a]">
      <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 z-10 w-full max-w-5xl">
        {/* --- DECORATIVE SECTION: VIRTUAL SCREEN & KEYBOARD --- */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* ANIMATED TEXT DISPLAY  */}
          <div className="w-full max-w-lg py-3 px-6 bg-[#111] border border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] overflow-hidden">
            <p className="text-xl md:text-2xl font-mono font-black tracking-widest text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] min-h-7 whitespace-nowrap">
              {displayText}
              <span className="animate-pulse text-white">|</span>
            </p>
          </div>
          {/* VIRTUAL KEYBOARD UI  */}
          <div className="flex flex-col gap-2 p-4 rounded-3xl border border-zinc-800 bg-[#111] shadow-2xl scale-75 sm:scale-90 font-mono">
            {keyboardRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex justify-center gap-1.5 sm:gap-2"
              >
                {row.map((key) => (
                  <div
                    key={key}
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-xs font-bold rounded-lg border transition-all duration-150
                      ${
                        isKeyActive(key)
                          ? "text-white border-blue-400 bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,1)] scale-110"
                          : "text-zinc-600 border-zinc-700 bg-[#0a0a0a]"
                      }`}
                  >
                    {key}
                  </div>
                ))}
              </div>
            ))}
            {/* Spacebar visualization */}
            <div className="flex justify-center mt-2">
              <div
                className={`w-32 sm:w-48 h-8 sm:h-10 rounded-lg border transition-all duration-150
                  ${displayText.endsWith(" ") ? "border-blue-400 bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,1)]" : "border-zinc-700 bg-[#0a0a0a]"}`}
              ></div>
            </div>
          </div>
        </div>

        {/* MAIN HERO TITLE */}
        <h1 className="max-w-4xl mb-4 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl text-white font-sans">
          Master Your{" "}
          <span className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-white to-cyan-400 bg-size-[200%_auto] animate-shimmer drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] font-black pb-2">
            Typing Speed
          </span>
        </h1>

        <p className="max-w-2xl mb-8 text-base text-zinc-400 md:text-lg font-sans">
          Elevate your typing skills with personalized text snippets. Create
          your own library and challenge yourself every day.
        </p>

        {/* CALL TO ACTION BUTTONS */}
        <div className="flex flex-col w-full gap-4 sm:w-auto sm:flex-row mb-8 font-sans">
          <Link
            href="/typing"
            className="flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all transform bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95"
          >
            Start Typing Now
          </Link>
          <Link
            href="/admin"
            className="flex items-center justify-center px-8 py-3 text-lg font-bold text-zinc-200 transition-all bg-[#161616] border-2 border-zinc-800 rounded-full hover:border-zinc-700 active:scale-95"
          >
            Manage Library
          </Link>
        </div>

        {/* SIGN UP CTA SECTION */}
        <div className="flex items-center gap-3 text-zinc-500 text-base md:text-lg font-medium animate-pulse mb-20 font-sans">
          <Sparkles size={20} className="text-blue-400" />
          <p>
            New here? {/* Link modified to trigger the Auth Modal */}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              className="text-zinc-300 font-bold underline cursor-pointer hover:text-blue-400 transition-colors"
            >
              Sign up
            </Link>{" "}
            to save progress!
          </p>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-1 font-sans bg-[#0a0a0a]/80 backdrop-blur-md py-2">
        <div className="h-px w-12 bg-zinc-800 mb-4"></div>
        <p className="text-zinc-600 text-[10px] sm:text-xs tracking-widest uppercase font-medium">
          © 2026 <span className="text-zinc-400">TyPingOn</span>. All rights
          reserved.
        </p>
      </div>

      {/* MODAL OVERLAY - Wrapped in text-left to fix alignment issues */}
      <div className="text-left w-full">
        <SignUpModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSignUpSuccess={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

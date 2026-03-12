"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Target,
  Activity,
  Trash2,
  Keyboard,
  Library,
  UserCircle,
  Loader2,
  AlertTriangle,
  X,
  ChevronDown,
} from "lucide-react";

interface TypingRecord {
  id: string;
  wpm: number;
  errors: number;
  words?: number;
  time?: number;
  createdAt: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<string | null>(null);
  const [records, setRecords] = useState<TypingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isNavOpen, setIsNavOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "single" | "all";
    id?: string;
  }>({ type: "single" });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("typingon_user");

      // --- GUEST: READ FROM LOCAL STORAGE ---
      if (!storedUser) {
        const savedRecords = localStorage.getItem("typingon_records");
        if (savedRecords) {
          setRecords(JSON.parse(savedRecords));
        }
        setIsLoading(false);
        return;
      }

      // --- LOGIN: READ FROM DATABASE ---
      setUser(storedUser);
      try {
        const res = await fetch(
          `http://localhost:3001/records?username=${storedUser}`,
        );
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        }
      } catch (error) {
        console.error("❌ Error fetching data from server:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const bestRecord =
    records.length > 0
      ? records.reduce(
          (best, current) => (current.wpm > best.wpm ? current : best),
          records[0],
        )
      : null;

  const bestWPM = bestRecord ? bestRecord.wpm : 0;
  const bestWords = bestRecord?.words ?? 0;
  const bestTime = bestRecord?.time ?? 0;

  const confirmDelete = async () => {
    try {
      if (modalConfig.type === "single" && modalConfig.id) {
        // Guest: Delete in Local Storage
        if (!user) {
          const updatedRecords = records.filter((r) => r.id !== modalConfig.id);
          setRecords(updatedRecords);
          localStorage.setItem(
            "typingon_records",
            JSON.stringify(updatedRecords),
          );
          setShowModal(false);
          return;
        }

        // LOGIN: Call API to delete from Database
        const res = await fetch(
          `http://localhost:3001/records/${modalConfig.id}`,
          { method: "DELETE" },
        );

        if (res.ok) {
          setRecords(records.filter((r) => r.id !== modalConfig.id));
        } else {
          console.error("❌ Backend refused to delete this record!");
        }
      } else if (modalConfig.type === "all") {
        // Guest: Delete all in Local Storage
        if (!user) {
          setRecords([]);
          localStorage.removeItem("typingon_records");
          setShowModal(false);
          return;
        }

        // Login: Delete all in Database
        const res = await fetch(
          `http://localhost:3001/records?username=${user}`,
          { method: "DELETE" },
        );

        if (res.ok) {
          setRecords([]);
          // Clear local storage in case of waste storage
          localStorage.removeItem("typingon_records");
        } else {
          console.error("❌ Backend refused to clear all records!");
        }
      }
    } catch (error) {
      console.error("🔌 Connection error during deletion:", error);
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans text-zinc-100 min-h-[calc(100vh-80px)]">
      {/* HEADER & MENU DROPDOWN */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 sm:mb-10">
        <div className="w-full text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Welcome, <span className="text-blue-400">{user || "Guest"}</span>!
          </h1>
        </div>

        <div className="relative w-full sm:w-auto z-20">
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="flex items-center justify-between w-full sm:w-56 gap-3 bg-[#161616] px-5 py-3.5 rounded-xl border border-zinc-800 border-l-4 border-l-blue-500 shadow-[-8px_0_20px_-5px_rgba(59,130,246,0.5)] hover:bg-zinc-800 hover:shadow-[-8px_0_25px_-5px_rgba(59,130,246,0.7)] transition-all duration-300 text-white font-bold text-sm sm:text-base"
          >
            <div className="flex items-center gap-2">
              <UserCircle size={20} className="text-blue-400" />
              <span>Overview</span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                isNavOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isNavOpen && (
            <div className="absolute top-full right-0 w-full sm:w-56 mt-2 bg-[#1a1a1a] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-5 py-3.5 bg-zinc-800/50 text-blue-400 font-bold border-l-2 border-blue-500"
              >
                <UserCircle size={18} /> Overview
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-5 py-3.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <Library size={18} /> Library
              </Link>
              <Link
                href="/typing"
                className="flex items-center gap-3 px-5 py-3.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <Keyboard size={18} /> Practice
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
        <div className="bg-[#161616] border border-zinc-800 p-5 sm:p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="p-3 sm:p-4 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-zinc-500 text-xs sm:text-sm mb-1 font-semibold uppercase tracking-wider">
              Best WPM
            </p>
            <p className="text-2xl sm:text-3xl font-black">{bestWPM}</p>
          </div>
        </div>

        <div className="bg-[#161616] border border-zinc-800 p-5 sm:p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="p-3 sm:p-4 bg-blue-500/10 text-blue-400 rounded-xl">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-zinc-500 text-xs sm:text-sm mb-1 font-semibold uppercase tracking-wider">
              Best Word(s)
            </p>
            {bestRecord && bestWords !== null ? (
              <p className="text-2xl sm:text-3xl font-black">
                {bestWords}{" "}
                <span className="text-sm font-medium text-zinc-600 lowercase tracking-normal">
                  in {bestTime}s
                </span>
              </p>
            ) : (
              <p className="text-sm text-zinc-600 italic mt-2">Not recorded</p>
            )}
          </div>
        </div>

        <div className="bg-[#161616] border border-zinc-800 p-5 sm:p-6 rounded-2xl flex items-center gap-4 shadow-sm sm:col-span-2 md:col-span-1 hover:border-zinc-700 transition-colors">
          <div className="p-3 sm:p-4 bg-purple-500/10 text-purple-400 rounded-xl">
            <Target size={28} />
          </div>
          <div>
            <p className="text-zinc-500 text-xs sm:text-sm mb-1 font-semibold uppercase tracking-wider">
              Total Tests
            </p>
            <p className="text-2xl sm:text-3xl font-black">{records.length}</p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex justify-between items-center bg-[#1a1a1a]">
          <h2 className="text-lg sm:text-xl font-bold">Recent Sessions</h2>
          {records.length > 0 && (
            <button
              onClick={() => {
                setModalConfig({ type: "all" });
                setShowModal(true);
              }}
              className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition px-3 py-1.5 rounded-lg border border-red-400/20 hover:bg-red-400/10"
            >
              <Trash2 size={14} /> CLEAR ALL
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <Loader2 className="animate-spin text-blue-400" size={32} />
            <p>Fetching data...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 italic">
            No records found. Start practicing!
          </div>
        ) : (
          <div className="overflow-x-auto w-full font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest bg-[#161616]">
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Speed</th>
                  <th className="p-4 font-medium">Word(s) / Time</th>
                  <th className="p-4 font-medium">Errors</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group ${
                      record.id === bestRecord?.id ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <td className="p-4 text-sm text-zinc-300">
                      {new Date(record.createdAt).toLocaleString()}
                      {record.id === bestRecord?.id && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                          BEST
                        </span>
                      )}
                    </td>
                    <td
                      className={`p-4 font-bold ${
                        record.id === bestRecord?.id
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    >
                      {record.wpm} WPM
                    </td>
                    <td className="p-4 text-sm text-zinc-300 font-medium">
                      {record.words != null && record.time != null ? (
                        <span>
                          {record.words} word(s){" "}
                          <span className="text-zinc-500 font-light mx-1">
                            in
                          </span>{" "}
                          {record.time}s
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">
                          Not recorded
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-red-400 font-medium">
                      {record.errors}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setModalConfig({ type: "single", id: record.id });
                          setShowModal(true);
                        }}
                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-in-center">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {modalConfig.type === "all"
                ? "Clear all records?"
                : "Delete this record?"}
            </h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              This action cannot be undone. Are you sure you want to permanently
              remove{" "}
              {modalConfig.type === "all"
                ? "all your typing sessions"
                : "this session"}
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

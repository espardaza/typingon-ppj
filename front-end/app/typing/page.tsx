"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Timer,
  Trophy,
  Tag,
  ChevronDown,
  CheckCircle,
  Loader2,
  Library as LibraryIcon,
} from "lucide-react";
import Link from "next/link";
import SignUpModal from "@/components/SignUpModal";

interface TypingSnippet {
  id: string;
  content: string;
  defaultTime: number;
  tags?: string[];
}

export default function TypingPage() {
  const [allSnippets, setAllSnippets] = useState<TypingSnippet[]>([]);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sign Up Modal
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const [playedSnippetIds, setPlayedSnippetIds] = useState<Set<string>>(
    new Set(),
  );

  const [snippet, setSnippet] = useState<TypingSnippet | null>(null);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("typingon_user")
      : null;

  // 1. FETCH DATA & EXTRACT TAGS
  useEffect(() => {
    const fetchSnippets = async () => {
      setIsLoading(true);
      let rawSnippets: TypingSnippet[] = [];

      if (!username) {
        // Visitors: Retrieve temporary library from LocalStorage
        const localData = localStorage.getItem("guest_snippets");
        rawSnippets = localData ? JSON.parse(localData) : [];
      } else {
        // Logged-in users: Fetch from Database
        try {
          const res = await fetch(
            `http://localhost:3001/snippets?username=${username}`,
          );
          if (res.ok) {
            const data: TypingSnippet[] = await res.json();
            rawSnippets = data.map((s) => ({
              ...s,
              content: s.content.trim().replace(/\s+/g, " "),
            }));
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }
      }

      setAllSnippets(rawSnippets);

      // --- EXTRACT TAGS ---
      if (rawSnippets.length > 0) {
        const tagsSet = new Set<string>();
        rawSnippets.forEach((s) => s.tags?.forEach((t) => tagsSet.add(t)));
        setUniqueTags(Array.from(tagsSet));

        // By default, select All after loading is complete.
        setSelectedTag("All");

        const random =
          rawSnippets[Math.floor(Math.random() * rawSnippets.length)];
        setSnippet(random);
        setTimeLeft(random.defaultTime);
        setPlayedSnippetIds(new Set([random.id]));
      } else {
        setSnippet(null);
        setUniqueTags([]);
      }

      setIsLoading(false);
    };

    fetchSnippets();
  }, [username]);

  // 2. CALCULATE WPM & ERRORS
  const calculateWPM = useCallback(
    (manualEnd?: number, finalInput?: string) => {
      if (!snippet || !startTime) return 0;
      const textToCalculate = finalInput !== undefined ? finalInput : userInput;

      let correctChars = 0;
      for (let i = 0; i < textToCalculate.length; i++) {
        if (textToCalculate[i] === snippet.content[i]) correctChars++;
      }
      const end = manualEnd || endTime || Date.now();
      const minutes = Math.max((end - startTime) / 60000, 0.001);
      return Math.round(correctChars / 5 / minutes);
    },
    [snippet, startTime, userInput, endTime],
  );

  const calculateErrors = useCallback(
    (finalInput?: string) => {
      if (!snippet) return 0;
      const textToCalculate = finalInput !== undefined ? finalInput : userInput;

      let err = 0;
      for (let i = 0; i < textToCalculate.length; i++) {
        if (textToCalculate[i] !== snippet.content[i]) err++;
      }
      return err;
    },
    [snippet, userInput],
  );

  // 3. SAVE POINTS TO LOCAL (FOR GUESTS) OR DATABASE (FOR USERS)
  const saveRecord = useCallback(
    async (
      wpm: number,
      errors: number,
      finalInput?: string,
      durationSeconds?: number,
    ) => {
      const typedText = finalInput || userInput;

     
      const typedWords = typedText.split(" ").filter(Boolean);
      const targetWords = snippet?.content.split(" ").filter(Boolean) || [];

      let correctWordsCount = 0;
      for (let i = 0; i < typedWords.length; i++) {
        if (typedWords[i] === targetWords[i]) {
          correctWordsCount++;
        }
      }

      const wordsCount = correctWordsCount;
      // ----------------------------------------------------------------

      const timeSpent = durationSeconds || 0;

      // GUEST -> SAVE IN LOCAL STORAGE
      if (!username) {
        const newRecord = {
          id: `guest-rec-${Date.now()}`,
          wpm,
          errors,
          words: wordsCount,
          time: timeSpent,
          createdAt: new Date().toISOString(),
        };
        const existingRecords = JSON.parse(
          localStorage.getItem("typingon_records") || "[]",
        );
        localStorage.setItem(
          "typingon_records",
          JSON.stringify([newRecord, ...existingRecords]),
        );
        return;
      }

      // USER ->CALL API TO SAVE TO DATABASE
      try {
        await fetch("http://localhost:3001/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            wpm,
            errors,
            words: wordsCount,
            time: timeSpent,
          }),
        });
      } catch (err) {
        console.error("Network error:", err);
      }
    },
    [username, userInput, snippet], 
  );

  const handleFinish = useCallback(
    (finalInput?: string) => {
      setIsFinished(true);
      const end = Date.now();
      setEndTime(end);
      const durationSeconds = startTime
        ? Math.round((end - startTime) / 1000)
        : 0;
      saveRecord(
        calculateWPM(end, finalInput),
        calculateErrors(finalInput),
        finalInput,
        durationSeconds,
      );
    },
    [calculateWPM, calculateErrors, saveRecord, startTime],
  );

  // 4. Main function to load next snippet based on selected tag and already played snippets
  const loadNextSnippet = useCallback(
    (tagToLoad: string = selectedTag) => {
      // Logic blocks Guest players from posting more than 2 sentences.
      if (!username && playedSnippetIds.size >= 2) {
        setShowSignUpModal(true);
        setIsFinished(true);
        return;
      }

      const pool =
        tagToLoad === "All"
          ? allSnippets
          : allSnippets.filter((s) => s.tags?.includes(tagToLoad));

      const unplayedPool = pool.filter((s) => !playedSnippetIds.has(s.id));

      if (unplayedPool.length > 0) {
        const random =
          unplayedPool[Math.floor(Math.random() * unplayedPool.length)];
        setSnippet(random);
        setTimeLeft(random.defaultTime);
        setUserInput("");
        setIsStarted(false);
        setIsFinished(false);
        setStartTime(null);
        setEndTime(null);
        setPlayedSnippetIds((prev) => new Set([...prev, random.id]));
        setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        setSnippet(null);
        setIsFinished(false);
      }
    },
    [allSnippets, selectedTag, playedSnippetIds, username],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSignUpModal) return;
      if (e.key === "Enter" && isFinished) loadNextSnippet();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, loadNextSnippet, showSignUpModal]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished]);

 
  useEffect(() => {
    if (isStarted && timeLeft === 0 && !isFinished) {
      handleFinish();
    }
  }, [timeLeft, isStarted, isFinished, handleFinish]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }
    const safeValue = snippet ? value.slice(0, snippet.content.length) : value;
    setUserInput(safeValue);
    if (snippet && safeValue.length >= snippet.content.length) {
      handleFinish(safeValue);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-zinc-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-zinc-400 hover:text-blue-400 transition font-sans"
        >
          <ArrowLeft size={20} /> Back to Admin
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 bg-[#161616] hover:bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-800 transition-colors text-zinc-300 font-sans text-sm min-w-40"
          >
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-zinc-500" />
              <span>
                {selectedTag === "All" ? "All Snippets" : `#${selectedTag}`}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  setSelectedTag("All");
                  setPlayedSnippetIds(new Set());
                  loadNextSnippet("All");
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800"
              >
                All Snippets
              </button>
              {/* --- DRAIN THE TAG LIST INTO THE DROPDOWN MENU --- */}
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setPlayedSnippetIds(new Set());
                    loadNextSnippet(tag);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TIMER */}
      <div className="flex justify-between items-center mb-12 bg-[#161616] p-6 rounded-2xl border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Timer
            className={
              timeLeft < 10 && isStarted
                ? "text-red-500 animate-pulse"
                : "text-blue-400"
            }
          />
          <span className="text-3xl font-bold tracking-tighter">
            {timeLeft}s
          </span>
        </div>
        <button
          onClick={() => loadNextSnippet()}
          className="p-2 rounded-full hover:bg-zinc-800 transition-all active:scale-90"
        >
          <RotateCcw className="text-zinc-500 hover:text-blue-400 transition hover:rotate-180 duration-500" />
        </button>
      </div>

      {/* THE AREA DISPLAYS EMPTY TEXT OR MESSAGES */}
      {!snippet ? (
        <div className="text-center py-24 px-6 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 bg-[#111]">
          {/* CHECK IF LIBRARTY IS EMPTY */}
          {allSnippets.length === 0 ? (
            <>
              <LibraryIcon className="w-16 h-16 text-zinc-600 mb-2" />
              <h3 className="text-2xl font-bold text-zinc-100">
                Your Library is Empty
              </h3>
              <p className="text-zinc-400 font-sans">
                You haven&apos;t added any snippets yet. Guests can add up to 2
                snippets.
              </p>
              <div className="flex flex-col gap-3 mt-4 w-full sm:w-auto">
                <Link
                  href="/dashboard"
                  className="px-8 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Create Snippet
                </Link>
                {!username && (
                  <button
                    onClick={() => setShowSignUpModal(true)}
                    className="text-sm font-sans text-zinc-500 hover:text-white underline mt-2"
                  >
                    Or sign up to unlock unlimited storage
                  </button>
                )}
              </div>
            </>
          ) : (
            // IF ALL SNIPPETS UNDER THIS TAG HAVE BEEN PLAYED
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
              <h3 className="text-2xl font-bold text-zinc-100">
                All Completed!
              </h3>
              <p className="text-zinc-400 font-sans">
                You have typed all snippets for{" "}
                <span className="text-blue-400 font-bold">#{selectedTag}</span>.
              </p>
              <button
                onClick={() => {
                  setPlayedSnippetIds(new Set());
                  loadNextSnippet();
                }}
                className="mt-4 text-blue-400 underline font-sans"
              >
                Restart this tag
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className="relative mb-8 p-8 sm:p-12 bg-[#111] rounded-3xl border border-zinc-800 shadow-inner min-h-60 cursor-text flex flex-col items-start overflow-hidden"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex justify-between w-full mb-6 pb-4 border-b border-zinc-800/50">
            <div className="flex gap-8 text-white font-sans text-sm tracking-widest font-bold opacity-90">
              <p>
                WORDS:{" "}
                <span className="text-white text-base">
                  {userInput.split(" ").filter(Boolean).length}
                </span>{" "}
                / {snippet.content.split(" ").filter(Boolean).length}
              </p>
              <p>
                CHARS:{" "}
                <span className="text-white text-base">{userInput.length}</span>{" "}
                / {snippet.content.length}
              </p>
            </div>
          </div>

          <div className="relative w-full text-justify whitespace-pre-wrap font-mono text-[32px] font-bold tracking-tight leading-[1.6]">
            <input
              ref={inputRef}
              type="text"
              className="absolute inset-0 opacity-0 cursor-default"
              value={userInput}
              onChange={handleTyping}
              autoFocus
              disabled={isFinished || showSignUpModal}
              autoComplete="off"
            />
            {snippet.content.split("").map((char, index) => {
              let colorClass = "text-zinc-600";
              if (index < userInput.length) {
                colorClass =
                  userInput[index] === char
                    ? "animate-neon-hit"
                    : "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
              }
              return (
                <span
                  key={index}
                  className={`relative transition-colors duration-200 ${colorClass}`}
                >
                  {index === userInput.length && (
                    <span className="absolute inset-x-0 -bottom-1 h-1 bg-blue-500 animate-pulse" />
                  )}
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {isFinished && !showSignUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161616] border border-zinc-800 p-8 rounded-4xl shadow-2xl text-center max-w-sm w-full transform transition-all scale-105 flex flex-col items-center">
            <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
            <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">
              Session Ended
            </h2>
            <p className="text-zinc-500 text-sm mb-8 font-sans">
              Great job, {username || "Guest"}! Here is your performance.
            </p>
            <div className="my-8 w-full flex flex-col items-center gap-6">
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-blue-400 tracking-tighter">
                  {calculateWPM()}
                </span>
                <span className="text-xl font-light uppercase text-zinc-500 tracking-widest">
                  WPM
                </span>
              </div>
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-6 py-2.5 rounded-2xl text-red-400">
                <span className="text-2xl font-bold">{calculateErrors()}</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  Errors
                </span>
              </div>
            </div>
            <button
              onClick={() => loadNextSnippet()}
              className="w-full py-4 font-bold text-white transition-all bg-blue-600 rounded-2xl hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/30"
            >
              Next Challenge
            </button>
          </div>
        </div>
      )}

      <div className="text-left w-full">
        <SignUpModal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onSignUpSuccess={() => setShowSignUpModal(false)}
        />
      </div>
    </div>
  );
}

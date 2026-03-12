"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  PlusCircle,
  Clock,
  ArrowLeft,
  Tag,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import SignUpModal from "@/components/SignUpModal";

interface TypingSnippet {
  id: string;
  content: string;
  defaultTime: number;
  tags?: string[];
}

export default function Dashboard() {
  const [snippets, setSnippets] = useState<TypingSnippet[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newTime, setNewTime] = useState(30);
  const [newTags, setNewTags] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  // State error management Hydration
  const [isMounted, setIsMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    type: "single" | "all";
    id?: string;
  }>({ type: "single" });

  // Combine them into the USE-EFFECT to avoid hydration errors.
  useEffect(() => {
    setIsMounted(true);

    const storedUser = localStorage.getItem("typingon_user");
    setUsername(storedUser);

    const fetchData = async () => {
      setIsLoading(true);

      if (!storedUser) {
        const localData = localStorage.getItem("guest_snippets");
        if (localData) {
          setSnippets(JSON.parse(localData));
        }
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3001/snippets?username=${storedUser}`,
        );
        const data = await res.json();
        setSnippets(data);
      } catch (error) {
        console.error("Data retrieval error::", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    snippets.forEach((s) => {
      if (s.tags) s.tags.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    if (selectedTag === "All") return snippets;
    return snippets.filter((s) => s.tags && s.tags.includes(selectedTag));
  }, [snippets, selectedTag]);

  const addSnippet = async () => {
    if (!newContent.trim()) return;

    if (!username && snippets.length >= 2) {
      setShowSignUpModal(true);
      return;
    }

    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== "");

    if (!username) {
      const newGuestSnippet: TypingSnippet = {
        id: `guest-${Date.now()}`,
        content: newContent,
        defaultTime: newTime,
        tags: tagsArray,
      };
      const updatedSnippets = [newGuestSnippet, ...snippets];
      setSnippets(updatedSnippets);
      localStorage.setItem("guest_snippets", JSON.stringify(updatedSnippets));

      setNewContent("");
      setNewTags("");
      setNewTime(30);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          content: newContent,
          defaultTime: newTime,
          tags: tagsArray,
        }),
      });

      if (res.ok) {
        const savedSnippet = await res.json();
        setSnippets([savedSnippet, ...snippets]);
        setNewContent("");
        setNewTags("");
        setNewTime(30);
      }
    } catch (error) {
      console.error("Lỗi lưu snippet:", error);
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfig.type === "single" && deleteConfig.id) {
        const updatedSnippets = snippets.filter(
          (s) => s.id !== deleteConfig.id,
        );

        if (!username) {
          setSnippets(updatedSnippets);
          localStorage.setItem(
            "guest_snippets",
            JSON.stringify(updatedSnippets),
          );
        } else {
          const res = await fetch(
            `http://localhost:3001/snippets/${deleteConfig.id}`,
            {
              method: "DELETE",
            },
          );
          if (res.ok) setSnippets(updatedSnippets);
        }
      } else if (deleteConfig.type === "all") {
        if (!username) {
          setSnippets([]);
          localStorage.removeItem("guest_snippets");
        } else {
          const res = await fetch(
            `http://localhost:3001/snippets?username=${username}`,
            {
              method: "DELETE",
            },
          );
          if (res.ok) setSnippets([]);
        }
      }
    } catch (error) {
      console.error("Connection error during deletion:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // If the interface is not yet mounted (still on the server), do not render anything to avoid hydration errors.
  if (!isMounted) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-zinc-100 relative min-h-screen">
      <Link
        href="/admin"
        className="flex items-center gap-2 text-zinc-400 hover:text-blue-400 mb-8 transition w-fit"
      >
        <ArrowLeft size={20} /> Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Your Library</h1>
        {!username && (
          <span className="text-xs font-bold px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg">
            Guest Limit: {snippets.length}/2
          </span>
        )}
      </div>

      {/* ADD NEW POST BOX */}
      <div className="bg-[#161616] p-6 rounded-2xl shadow-sm border border-zinc-800 mb-10 relative">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <PlusCircle size={20} className="text-blue-400" /> Add New Snippet
        </h2>

        <textarea
          className="w-full p-4 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-30 mb-4 bg-[#0a0a0a] text-white placeholder-zinc-600"
          placeholder="Paste your text here..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />

        <div className="flex items-center gap-2 w-full mb-6 border-b border-zinc-800 pb-6">
          <Tag size={20} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            className="w-full p-3 border border-zinc-700 rounded-lg bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-600"
            placeholder="Tags (comma separated)... e.g. code, javascript, hard"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Clock size={20} className="text-zinc-400" />
            <input
              type="number"
              className="border border-zinc-700 p-2 rounded-lg w-24 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTime}
              onChange={(e) => setNewTime(Number(e.target.value))}
              min="10"
            />
            <span className="text-zinc-500 text-sm italic">seconds</span>
          </div>
          <button
            onClick={addSnippet}
            className="w-full sm:w-auto ml-auto bg-blue-600 text-white px-8 py-2 rounded-full font-bold hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Save
          </button>
        </div>
      </div>

      {/* LIST DISPLAY FRAME */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-zinc-400 font-medium">
              Your Snippets ({filteredSnippets.length})
            </h2>
            {snippets.length > 0 && (
              <button
                onClick={() => {
                  setDeleteConfig({ type: "all" });
                  setShowDeleteModal(true);
                }}
                className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition px-3 py-1.5 rounded-lg border border-red-400/20 hover:bg-red-400/10"
              >
                <Trash2 size={14} /> CLEAR ALL
              </button>
            )}
          </div>

          {allUniqueTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag("All")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTag === "All" ? "bg-blue-600 text-white" : "bg-[#111] text-zinc-400 border border-zinc-800 hover:bg-zinc-800"}`}
              >
                All
              </button>
              {allUniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTag === tag ? "bg-blue-600 text-white" : "bg-[#111] text-zinc-400 border border-zinc-800 hover:bg-zinc-800"}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-blue-400" size={32} />
          </div>
        ) : filteredSnippets.length === 0 ? (
          <p className="text-center py-10 text-zinc-500 italic bg-[#161616] border border-zinc-800 rounded-2xl">
            {selectedTag === "All"
              ? "No snippets yet. Start adding some above!"
              : `No snippets found for tag "#${selectedTag}".`}
          </p>
        ) : (
          filteredSnippets.map((s) => (
            <div
              key={s.id}
              className="bg-[#161616] p-5 rounded-xl border border-zinc-800 flex justify-between items-start gap-4 hover:border-zinc-700 transition-colors"
            >
              <div className="overflow-hidden w-full">
                <p className="line-clamp-2 text-zinc-200 mb-3 font-mono">
                  {s.content}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-md">
                    <Clock size={12} /> {s.defaultTime}s
                  </span>
                  {s.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setDeleteConfig({ type: "single", id: s.id });
                  setShowDeleteModal(true);
                }}
                className="text-zinc-500 hover:text-red-500 p-2 transition-colors hover:bg-red-500/10 rounded-lg shrink-0"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-in-center">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {deleteConfig.type === "all"
                ? "Clear all snippets?"
                : "Delete this snippet?"}
            </h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              This action cannot be undone. Are you sure you want to permanently
              remove{" "}
              {deleteConfig.type === "all"
                ? "all snippets from your library"
                : "this snippet"}
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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

      <div className="text-left w-full">
        <SignUpModal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onSignUpSuccess={() => {
            setShowSignUpModal(false);
          }}
        />
      </div>
    </div>
  );
}

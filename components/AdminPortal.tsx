"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Key,
  Save,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Eye,
  LogOut,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  HelpCircle,
  Home,
  Check,
  X,
} from "lucide-react";

export interface StoryItem {
  id: number;
  src: string;
  tag: string;
  text: string;
  chapterNumber: string;
  subTitle: string;
  question?: string;
  answer?: string;
}

export interface HomeContent {
  badgeText: string;
  mainTitle: string;
  titleHighlight: string;
  subtitle: string;
  cardTitle: string;
  cardSubtitle: string;
  buttonText: string;
  leftTag: string;
  rightTag: string;
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  badgeText: "5th Anniversary • September 17, 2021 – 2026 🌹",
  mainTitle: "14 Chapters of",
  titleHighlight: "Us.",
  subtitle: "Started on September 17, 2021. Every glance, bus ride, and quiet moment brought us to 5 beautiful years.",
  cardTitle: "The Illustrated Diary",
  cardSubtitle: "14 Memory Pages • Sealed Anniversary Note",
  buttonText: "Open Storybook",
  leftTag: "Sep 17, 2021 – Sep 17, 2026",
  rightTag: "5th Anniversary",
};

interface AdminPortalProps {
  storyItems: StoryItem[];
  letterContent: string;
  homeContent?: HomeContent;
  onUpdateData: (items: StoryItem[], letter: string, home: HomeContent) => Promise<void>;
  onClose?: () => void;
}

export default function AdminPortal({
  storyItems: initialItems,
  letterContent: initialLetter,
  homeContent: initialHome,
  onUpdateData,
  onClose,
}: AdminPortalProps) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Content edit state
  const [items, setItems] = useState<StoryItem[]>(initialItems);
  const [letter, setLetter] = useState(initialLetter);
  const [home, setHome] = useState<HomeContent>(initialHome || DEFAULT_HOME_CONTENT);
  const [activeTab, setActiveTab] = useState<"chapters" | "home" | "letter">("chapters");
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check if session token exists
  useEffect(() => {
    const token = localStorage.getItem("love_admin_token");
    if (token === "auth_token_love_anniversary_2026_valid") {
      setIsAuthenticated(true);
    }
  }, []);

  // Update local state if props change
  useEffect(() => {
    setItems(initialItems);
    setLetter(initialLetter);
    if (initialHome) setHome(initialHome);
  }, [initialItems, initialLetter, initialHome]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("love_admin_token", data.token);
      } else {
        setAuthError(data.message || "Invalid username or password");
      }
    } catch {
      setAuthError("Failed to connect to authentication server");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("love_admin_token");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // Handle Edit Chapter Field
  const handleItemChange = (
    id: number,
    field: keyof StoryItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Handle Edit Home Field
  const handleHomeChange = (field: keyof HomeContent, value: string) => {
    setHome((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Image Upload for a specific chapter
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    chapterId: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        handleItemChange(chapterId, "src", data.url);
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Error uploading image file.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Add a new chapter
  const handleAddNewChapter = () => {
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newChapter: StoryItem = {
      id: nextId,
      src: "/AN_Story/Img_1_An.png",
      tag: "New Memory",
      text: "Write your special memory description here...",
      chapterNumber: nextId < 10 ? `0${nextId}` : `${nextId}`,
      subTitle: "New Chapter Title",
      question: "What special memory happened here?",
      answer: "Love",
    };
    setItems((prev) => [...prev, newChapter]);
    setSelectedChapterId(nextId);
    setActiveTab("chapters");
  };

  // Delete a chapter
  const handleDeleteChapter = (id: number) => {
    if (items.length <= 1) {
      alert("You must keep at least 1 chapter!");
      return;
    }
    if (confirm(`Are you sure you want to delete Chapter ${id}?`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedChapterId === id) {
        const remaining = items.filter((i) => i.id !== id);
        setSelectedChapterId(remaining[0]?.id || 1);
      }
    }
  };

  // Save all changes to backend API
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccessMsg("");
    try {
      await onUpdateData(items, letter, home);
      setSaveSuccessMsg("All changes saved successfully! ✨");
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    } catch {
      alert("Error saving data to backend.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedItem = items.find((i) => i.id === selectedChapterId) || items[0];

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-[#ece5dd] rounded-3xl p-8 shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Admin Management Portal
            </h2>
            <p className="text-xs text-gray-500">
              Protected authentication required to manage Home Page, Story Chapters & Answers.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 bg-gray-50 text-sm font-sans text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 bg-gray-50 text-sm font-sans text-gray-900"
                required
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>{isLoggingIn ? "Authenticating..." : "Login to Admin Portal"}</span>
            </button>
          </form>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-center text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel & Return to Story
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // DASHBOARD INTERFACE
  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-[#ece5dd] shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              title="Return to main story"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>Admin Management Portal</span>
              <Sparkles className="w-5 h-5 text-red-500" />
            </h1>
            <p className="text-xs text-gray-500">
              Customize Home Page, Chapter images, text, questions & correct answers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccessMsg && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              {saveSuccessMsg}
            </span>
          )}

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
            title="Logout from Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "home"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home Page Cover Customizer</span>
        </button>

        <button
          onClick={() => setActiveTab("chapters")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "chapters"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Manage Chapters ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("letter")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "letter"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Sealed Note Content</span>
        </button>

        <button
          onClick={handleAddNewChapter}
          className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto border border-rose-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Chapter Page</span>
        </button>
      </div>

      {/* TAB: HOME COVER CUSTOMIZER */}
      {activeTab === "home" && (
        <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200 space-y-5">
          <div className="pb-3 border-b border-gray-200">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Edit Home / Landing Page Contents</span>
              <Home className="w-5 h-5 text-red-500" />
            </h2>
            <p className="text-xs text-gray-500">
              Customize headline text, memory subtitle, milestone badge, button labels & corner dates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Main Headline Text
              </label>
              <input
                type="text"
                value={home.mainTitle}
                onChange={(e) => handleHomeChange("mainTitle", e.target.value)}
                placeholder="e.g. 14 Chapters of"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Headline Highlight Phrase (Red Italic Text)
              </label>
              <input
                type="text"
                value={home.titleHighlight}
                onChange={(e) => handleHomeChange("titleHighlight", e.target.value)}
                placeholder="e.g. Us."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Home Subtitle / Anniversary Memory Text
            </label>
            <textarea
              rows={3}
              value={home.subtitle}
              onChange={(e) => handleHomeChange("subtitle", e.target.value)}
              placeholder="e.g. Started on September 17, 2021. Every glance, bus ride, and quiet moment brought us to 5 beautiful years."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 leading-relaxed font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Milestone Pill Badge Text
              </label>
              <input
                type="text"
                value={home.badgeText}
                onChange={(e) => handleHomeChange("badgeText", e.target.value)}
                placeholder="e.g. 5th Anniversary • September 17, 2021 – 2026 🌹"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Red Heart Button CTA Label
              </label>
              <input
                type="text"
                value={home.buttonText}
                onChange={(e) => handleHomeChange("buttonText", e.target.value)}
                placeholder="e.g. Open Storybook"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Top Left Corner Date Tag
              </label>
              <input
                type="text"
                value={home.leftTag}
                onChange={(e) => handleHomeChange("leftTag", e.target.value)}
                placeholder="e.g. Sep 17, 2021 – Sep 17, 2026"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Top Right Corner Tag
              </label>
              <input
                type="text"
                value={home.rightTag}
                onChange={(e) => handleHomeChange("rightTag", e.target.value)}
                placeholder="e.g. 5th Anniversary"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                3D Emblem Card Title
              </label>
              <input
                type="text"
                value={home.cardTitle}
                onChange={(e) => handleHomeChange("cardTitle", e.target.value)}
                placeholder="e.g. The Illustrated Diary"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                3D Emblem Card Subtitle
              </label>
              <input
                type="text"
                value={home.cardSubtitle}
                onChange={(e) => handleHomeChange("cardSubtitle", e.target.value)}
                placeholder="e.g. 14 Memory Pages • Sealed Anniversary Note"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: CHAPTERS MANAGER */}
      {activeTab === "chapters" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Select Chapter Page to Edit
            </h3>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedChapterId(item.id)}
                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  selectedChapterId === item.id
                    ? "bg-red-50 border-red-500 text-red-900 font-semibold shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-[10px] text-red-600 shrink-0">
                    {item.chapterNumber}
                  </span>
                  <div className="truncate">
                    <div className="font-medium truncate">{item.subTitle}</div>
                    <div className="text-[10px] text-gray-400 truncate">{item.tag}</div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChapter(item.id);
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition-colors"
                  title="Delete Chapter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Chapter Edit Form */}
          {selectedItem && (
            <div className="md:col-span-8 bg-gray-50/80 p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>Editing Chapter {selectedItem.chapterNumber}</span>
                  <span className="text-xs font-sans font-normal text-gray-500">
                    (ID: {selectedItem.id})
                  </span>
                </h2>
                <button
                  onClick={() => handleDeleteChapter(selectedItem.id)}
                  className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Chapter</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Chapter Number / Code
                  </label>
                  <input
                    type="text"
                    value={selectedItem.chapterNumber}
                    onChange={(e) =>
                      handleItemChange(selectedItem.id, "chapterNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tag / Milestone Label
                  </label>
                  <input
                    type="text"
                    value={selectedItem.tag}
                    onChange={(e) =>
                      handleItemChange(selectedItem.id, "tag", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Heading / Subtitle
                </label>
                <input
                  type="text"
                  value={selectedItem.subTitle}
                  onChange={(e) =>
                    handleItemChange(selectedItem.id, "subTitle", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description / Story Memory Text
                </label>
                <textarea
                  rows={3}
                  value={selectedItem.text}
                  onChange={(e) =>
                    handleItemChange(selectedItem.id, "text", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 leading-relaxed"
                />
              </div>

              {/* Image Path & Upload */}
              <div className="space-y-2 p-3 bg-white rounded-xl border border-gray-200">
                <label className="block text-xs font-semibold text-gray-800 flex items-center justify-between">
                  <span>PNG Image Source Path</span>
                  {uploadingImage && (
                    <span className="text-[10px] text-red-600 animate-pulse">Uploading file...</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedItem.src}
                    onChange={(e) =>
                      handleItemChange(selectedItem.id, "src", e.target.value)
                    }
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono bg-gray-50 text-gray-900"
                  />
                  <label className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PNG</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, selectedItem.id)}
                    />
                  </label>
                </div>
              </div>

              {/* Quiz Q&A Box */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Chapter Unlock Quiz Question & Answer</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Question (Prompt shown to unlock Next Page)
                  </label>
                  <input
                    type="text"
                    value={selectedItem.question || ""}
                    onChange={(e) =>
                      handleItemChange(selectedItem.id, "question", e.target.value)
                    }
                    placeholder="Enter unlock question..."
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1 flex items-center justify-between">
                    <span>Correct Answer (Visible in Backend)</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Answer Key
                    </span>
                  </label>
                  <input
                    type="text"
                    value={selectedItem.answer || ""}
                    onChange={(e) =>
                      handleItemChange(selectedItem.id, "answer", e.target.value)
                    }
                    placeholder="Enter correct answer..."
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: FINALE LETTER EDITOR */}
      {activeTab === "letter" && (
        <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
          <h3 className="font-serif text-lg font-bold text-gray-900">
            Edit Finale Sealed Note Content
          </h3>
          <p className="text-xs text-gray-500">
            This love note will be revealed when the wax seal is broken on Page 15.
          </p>

          <textarea
            rows={12}
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm font-serif text-gray-800 leading-relaxed focus:ring-2 focus:ring-red-500"
          />
        </div>
      )}
    </div>
  );
}

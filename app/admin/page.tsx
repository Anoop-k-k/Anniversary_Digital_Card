"use client";

import React, { useState, useEffect } from "react";
import AdminPortal, { StoryItem, HomeContent, DEFAULT_HOME_CONTENT } from "@/components/AdminPortal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);
  const [letterContent, setLetterContent] = useState("");
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [loading, setLoading] = useState(true);

  // Fetch story items from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/story");
        if (res.ok) {
          const data = await res.json();
          if (data.storyItems) setStoryItems(data.storyItems);
          if (data.letterContent) setLetterContent(data.letterContent);
          if (data.homeContent) setHomeContent(data.homeContent);
        }
      } catch (err) {
        console.error("Failed to load story data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateData = async (items: StoryItem[], letter: string, home: HomeContent) => {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyItems: items, letterContent: letter, homeContent: home }),
    });
    if (!res.ok) {
      throw new Error("Failed to update story data");
    }
    setStoryItems(items);
    setLetterContent(letter);
    setHomeContent(home);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-600">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storybook</span>
        </Link>
      </div>

      <AdminPortal
        storyItems={storyItems}
        letterContent={letterContent}
        homeContent={homeContent}
        onUpdateData={handleUpdateData}
      />
    </div>
  );
}

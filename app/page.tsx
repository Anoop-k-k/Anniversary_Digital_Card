"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Check,
  Copy,
  BookOpen,
  Feather,
  Grid,
  RotateCw,
  Calendar,
  Key,
  HelpCircle,
  AlertCircle,
  X,
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import CustomCursor from "@/components/CustomCursor";
import BookPageFlip from "@/components/BookPageFlip";
import AdminPortal, { StoryItem, HomeContent, DEFAULT_HOME_CONTENT } from "@/components/AdminPortal";

// Web Audio API Synthesizer for Tactile Micro-Interactions
const playSoundEffect = (type: "unlock" | "seal" | "click" | "flip" | "error", enabled: boolean) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "unlock") {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.35);
      });
    } else if (type === "error") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === "seal") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "flip") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch {
    // Audio autoplay fallback
  }
};

const DEFAULT_STORY_ITEMS: StoryItem[] = [
  {
    id: 1,
    src: "/AN_Story/Img_1_An.png",
    tag: "The Beginning",
    text: "Waiting outside, nervous heartbeats, and stolen glances on September 17, 2021.",
    chapterNumber: "01",
    subTitle: "First Glance & Nervous Butterflies",
    question: "On which date did our story begin with nervous heartbeats?",
    answer: "September 17, 2021",
  },
  {
    id: 2,
    src: "/AN_Story/Img_2_Hopital_An.png",
    tag: "Quiet Moments",
    text: "Sitting together in silence, finding comfort right beside each other.",
    chapterNumber: "02",
    subTitle: "Unspoken Sanctuary",
    question: "Where did we sit together in quiet silence finding comfort?",
    answer: "Hospital",
  },
  {
    id: 3,
    src: "/AN_Story/Img_3_Msg_An.png",
    tag: "That First Text",
    text: "That heart-drop moment when your message popped up: 'Nandu 😍'.",
    chapterNumber: "03",
    subTitle: "The Notification That Changed Everything",
    question: "What special nickname popped up in that heart-drop notification message?",
    answer: "Nandu",
  },
  {
    id: 4,
    src: "/AN_Story/Img_4_Pro_An.png",
    tag: "Late Night Confessions",
    text: "Late night typing, trembling fingers, and 'Enk ninna ishtann'.",
    chapterNumber: "04",
    subTitle: "Whispers Across Screens",
    question: "What romantic confession phrase did we type with trembling fingers?",
    answer: "Enk ninna ishtann",
  },
  {
    id: 5,
    src: "/AN_Story/Img_5_Room_An.png",
    tag: "The Surprise Visit",
    text: "Panicking over my messy room, then cleaning it up in record time.",
    chapterNumber: "05",
    subTitle: "Sprint for Perfection",
    question: "What was being cleaned in record time before the surprise visit?",
    answer: "Room",
  },
  {
    id: 6,
    src: "/AN_Story/Img_6_KSRTC_An.png",
    tag: "First Hand Hold",
    text: "Masked up on the KSRTC bus, our hands meeting for the very first time.",
    chapterNumber: "06",
    subTitle: "A Journey of Touch",
    question: "On which bus service did our hands meet for the very first time?",
    answer: "KSRTC",
  },
  {
    id: 7,
    src: "/AN_Story/Img_7_Pozha_An.png",
    tag: "By The River",
    text: "Quiet golden hour by the riverbank. A moment frozen forever.",
    chapterNumber: "07",
    subTitle: "Golden Hour Serenade",
    question: "Where were we sitting during that peaceful golden hour moment?",
    answer: "Riverbank",
  },
  {
    id: 8,
    src: "/AN_Story/Img_8_Lift_An.png",
    tag: "First Drive",
    text: "First car ride selfie together. Same roads, brand new beginnings.",
    chapterNumber: "08",
    subTitle: "Cruising into Tomorrow",
    question: "What vehicle took us on our first drive together?",
    answer: "Car",
  },
  {
    id: 9,
    src: "/AN_Story/Img_9_First_View_point_An.png",
    tag: "Peace",
    text: "Falling asleep peacefully on my shoulder while the world passed by.",
    chapterNumber: "09",
    subTitle: "Resting in Safe Arms",
    question: "Where did you fall asleep peacefully while the world passed by?",
    answer: "Shoulder",
  },
  {
    id: 10,
    src: "/AN_Story/Img_10_Shukriya_An.png",
    tag: "Shukriya Bus",
    text: "Leaning on each other on the Kasaragod-Kozhikode route.",
    chapterNumber: "10",
    subTitle: "Miles of Shared Warmth",
    question: "Which destination route brought us miles of shared warmth on the bus?",
    answer: "Kasaragod to Kozhikode",
  },
  {
    id: 11,
    src: "/AN_Story/Img_11_Issue_An.png",
    tag: "Tough Days",
    text: "Working through misunderstandings, learning to listen and understand.",
    chapterNumber: "11",
    subTitle: "Growing Stronger Together",
    question: "What helped us grow stronger through tough days and misunderstandings?",
    answer: "Listening and understanding",
  },
  {
    id: 12,
    src: "/AN_Story/Img_12_Long_An.png",
    tag: "Long Distance",
    text: "Late study sessions, laptop screens, and counting down the miles.",
    chapterNumber: "12",
    subTitle: "Bridges Across Distance",
    question: "What bridged our hearts during late distance study sessions?",
    answer: "Laptop screens",
  },
  {
    id: 13,
    src: "/AN_Story/Img_13_Train_An.png",
    tag: "Journey Back",
    text: "Platform goodbyes, train tickets, and the ache to see each other again.",
    chapterNumber: "13",
    subTitle: "The Countdown to Reunions",
    question: "Where were our sweet goodbyes and tickets held during reunions?",
    answer: "Train platform",
  },
  {
    id: 14,
    src: "/AN_Story/Img_14_Final_An.png",
    tag: "Sep 17, 2021 – Sep 17, 2026",
    text: "Five whole years of memories, lessons, and unconditional love.",
    chapterNumber: "14",
    subTitle: "Forever & Ever",
    question: "How many years of unconditional love are we celebrating?",
    answer: "5 years",
  },
];

const DEFAULT_LETTER_CONTENT = `Dearest Nandu,

Happy 5th Anniversary, my love! ❤️
(September 17, 2021 – September 17, 2026)

Looking back over these 14 illustrated chapters and 1,826 unforgettable days since September 17, 2021, my heart overflows with gratitude. From those nervous stolen glances outside to our long bus rides, late-night calls, and every milestone in between—loving you has been the single best journey of my life.

We have laughed together, held each other through tough days, crossed distance, and built a sanctuary of unconditional trust and warmth. 

Five years is only our beginning. I choose you today, tomorrow, and for all the chapters yet to be written.

Forever and always yours,
With all my heart ✨`;

const PETAL_ITEMS = [
  { id: 1, left: "6%", delay: "0s", duration: "12s", size: "1.4rem", symbol: "🌸" },
  { id: 2, left: "18%", delay: "3s", duration: "14s", size: "1.6rem", symbol: "🌹" },
  { id: 3, left: "32%", delay: "1.2s", duration: "11s", size: "1.2rem", symbol: "✨" },
  { id: 4, left: "46%", delay: "4.5s", duration: "15s", size: "1.5rem", symbol: "💖" },
  { id: 5, left: "58%", delay: "0.8s", duration: "13s", size: "1.3rem", symbol: "🌸" },
  { id: 6, left: "72%", delay: "2.8s", duration: "12s", size: "1.7rem", symbol: "🌺" },
  { id: 7, left: "84%", delay: "5.2s", duration: "16s", size: "1.3rem", symbol: "🌹" },
  { id: 8, left: "94%", delay: "2.1s", duration: "10s", size: "1.5rem", symbol: "🌸" },
];

export default function PaginatedStorybook() {
  // Story Data State
  const [storyItems, setStoryItems] = useState<StoryItem[]>(DEFAULT_STORY_ITEMS);
  const [letterContent, setLetterContent] = useState<string>(DEFAULT_LETTER_CONTENT);
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  // Navigation State: 0 = Landing, 1..N = Chapters, N+1 = Finale Sealed Letter
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [waxBroken, setWaxBroken] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showOverviewDrawer, setShowOverviewDrawer] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Q&A Quiz & Lock State per session
  const [unlockedChapters, setUnlockedChapters] = useState<Set<number>>(new Set([1])); // Chapter 1 unlocked by default
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizErrors, setQuizErrors] = useState<Record<number, string>>({});
  const [shakeLock, setShakeLock] = useState(false);

  // Fetch story data from API on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const res = await fetch("/api/story");
        if (res.ok) {
          const data = await res.json();
          if (data.storyItems && data.storyItems.length > 0) {
            setStoryItems(data.storyItems);
          }
          if (data.letterContent) {
            setLetterContent(data.letterContent);
          }
          if (data.homeContent) {
            setHomeContent(data.homeContent);
          }
        }
      } catch (err) {
        console.error("Using default story data fallback:", err);
      }
    }
    loadBackendData();
  }, []);

  // Update Data Handler for Admin Portal
  const handleAdminUpdateData = async (newItems: StoryItem[], newLetter: string, newHome: HomeContent) => {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyItems: newItems, letterContent: newLetter, homeContent: newHome }),
    });
    if (!res.ok) throw new Error("Failed to save data");

    setStoryItems(newItems);
    setLetterContent(newLetter);
    setHomeContent(newHome);
  };

  // Check Quiz Answer for Current Page
  const handleCheckAnswer = (chapterId: number) => {
    const item = storyItems.find((i) => i.id === chapterId);
    if (!item) return;

    const inputAns = (userAnswers[chapterId] || "").trim().toLowerCase();
    const targetAns = (item.answer || "").trim().toLowerCase();

    if (!inputAns) {
      setQuizErrors((prev) => ({ ...prev, [chapterId]: "Please type your answer above!" }));
      playSoundEffect("error", soundEnabled);
      return;
    }

    // Flexible answer validation: exact or sub-string match
    if (inputAns === targetAns || targetAns.includes(inputAns) || inputAns.includes(targetAns)) {
      playSoundEffect("unlock", soundEnabled);
      setUnlockedChapters((prev) => new Set([...Array.from(prev), chapterId + 1])); // Unlock next chapter
      setQuizErrors((prev) => ({ ...prev, [chapterId]: "" }));

      // Confetti reward burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#dc2626", "#fb7185", "#fbbf24", "#ffffff"],
      });
    } else {
      playSoundEffect("error", soundEnabled);
      setQuizErrors((prev) => ({
        ...prev,
        [chapterId]: "Incorrect answer! Think back to that special memory.",
      }));
    }
  };

  // Check if next page is accessible
  const isPageUnlocked = (targetPageIndex: number) => {
    if (targetPageIndex <= 1) return true; // Landing & Chapter 1 always unlocked
    if (targetPageIndex > storyItems.length + 1) return false;
    if (targetPageIndex === storyItems.length + 1) {
      // Finale page unlocked if final chapter is unlocked
      return unlockedChapters.has(storyItems.length);
    }
    return unlockedChapters.has(targetPageIndex);
  };

  // Page Navigation Handlers
  const goToNextPage = useCallback(
    (e?: React.MouseEvent) => {
      playSoundEffect("flip", soundEnabled);
      const finaleIndex = storyItems.length + 1;

      if (pageIndex < finaleIndex) {
        const nextIdx = pageIndex + 1;
        if (nextIdx > 1 && !isPageUnlocked(nextIdx)) {
          // Locked warning shake animation
          setShakeLock(true);
          playSoundEffect("error", soundEnabled);
          setTimeout(() => setShakeLock(false), 800);
          return;
        }

        setDirection(1);
        setPageIndex((prev) => prev + 1);
      }
    },
    [pageIndex, soundEnabled, storyItems.length, unlockedChapters]
  );

  const goToPrevPage = useCallback(
    (e?: React.MouseEvent) => {
      playSoundEffect("flip", soundEnabled);
      if (pageIndex > 0) {
        setDirection(-1);
        setPageIndex((prev) => prev - 1);
      }
    },
    [pageIndex, soundEnabled]
  );

  const jumpToPage = useCallback(
    (targetIndex: number, e?: React.MouseEvent) => {
      playSoundEffect("click", soundEnabled);
      if (targetIndex > 1 && !isPageUnlocked(targetIndex)) {
        setShakeLock(true);
        playSoundEffect("error", soundEnabled);
        setTimeout(() => setShakeLock(false), 800);
        return;
      }
      setDirection(targetIndex > pageIndex ? 1 : -1);
      setPageIndex(targetIndex);
      setShowOverviewDrawer(false);
    },
    [pageIndex, soundEnabled, unlockedChapters]
  );

  // Break Wax Seal & Trigger Confetti
  const handleBreakWaxSeal = () => {
    playSoundEffect("seal", soundEnabled);
    setWaxBroken(true);

    const end = Date.now() + 3.2 * 1000;
    const colors = ["#dc2626", "#d98094", "#e8a5b2", "#d4af37", "#ffffff", "#8b4b57"];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.65 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Copy Letter Content
  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letterContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const finalePageIndex = storyItems.length + 1;
  const currentChapterItem =
    pageIndex >= 1 && pageIndex <= storyItems.length ? storyItems[pageIndex - 1] : null;
  const currentChapterUnlocked = pageIndex >= 1 && pageIndex <= storyItems.length ? unlockedChapters.has(pageIndex + 1) : true;

  return (
    <div className="relative min-h-screen bg-[#faf8f5] text-[#2c2825] font-sans selection:bg-[#f3d3da] selection:text-[#8b4b57] flex flex-col justify-between overflow-x-hidden">
      {/* 3D Interactive Floating Canvas Background */}
      <ThreeBackground />

      {/* Custom Animated Cursor & Click Explosion Effects */}
      <CustomCursor />

      {/* Background Soft Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#f8d7da]/40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full bg-[#fce1e6]/45 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-[#f4e2d8]/40 blur-3xl" />
      </div>

      {/* Falling Floral Petals for Home Landing Cover */}
      {pageIndex === 0 && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {PETAL_ITEMS.map((petal) => (
            <div
              key={petal.id}
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
                fontSize: petal.size,
              }}
              className="absolute top-0 animate-petal opacity-80 select-none"
            >
              {petal.symbol}
            </div>
          ))}
        </div>
      )}

      {/* TOP RESPONSIVE NAV BAR */}
      <header className="sticky top-0 z-40 glass-cream px-4 sm:px-8 py-3 flex items-center justify-between border-b border-[#ece5dd]/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => jumpToPage(0, e)}
            className="w-9 h-9 rounded-full bg-red-600/15 flex items-center justify-center text-red-600 hover:scale-105 transition-transform cursor-pointer shadow-2xs"
            title="Return to Cover"
          >
            <Heart className="w-5 h-5 fill-red-600 stroke-none" />
          </button>
          <div>
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#1a1615] leading-none">
              Our Love Storybook • 5 Years
            </h1>
            <span className="text-[10px] sm:text-[11px] font-sans tracking-wide uppercase text-gray-700 flex items-center gap-1 mt-0.5 font-semibold">
              <Calendar className="w-3 h-3 text-red-600" />
              <span>{homeContent.leftTag || "Sep 17, 2021 – Sep 17, 2026"}</span>
            </span>
          </div>
        </div>

        {/* Quick Chapter Dots Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#f4efea] px-3.5 py-1.5 rounded-full border border-[#ece5dd]">
          <BookOpen className="w-3.5 h-3.5 text-red-600 mr-1" />
          <button
            onClick={(e) => jumpToPage(0, e)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              pageIndex === 0 ? "bg-red-600 scale-125" : "bg-red-600/30 hover:bg-red-600"
            }`}
            title="Cover"
          />
          {storyItems.map((item) => (
            <button
              key={item.id}
              onClick={(e) => jumpToPage(item.id, e)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                pageIndex === item.id
                  ? "bg-red-600 scale-125"
                  : isPageUnlocked(item.id)
                  ? "bg-red-600/40 hover:bg-red-600"
                  : "bg-gray-300 opacity-50"
              }`}
              title={`Chapter ${item.id}`}
            />
          ))}
          <button
            onClick={(e) => jumpToPage(finalePageIndex, e)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              pageIndex === finalePageIndex
                ? "bg-red-600 scale-125"
                : isPageUnlocked(finalePageIndex)
                ? "bg-red-600/40 hover:bg-red-600"
                : "bg-gray-300 opacity-50"
            }`}
            title="Finale Sealed Note"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverviewDrawer(!showOverviewDrawer)}
            className="p-2 rounded-full bg-white border border-[#ece5dd] text-gray-700 hover:text-red-600 shadow-2xs transition-colors cursor-pointer"
            title="Chapter Index"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full bg-white border border-[#ece5dd] text-gray-700 hover:text-red-600 shadow-2xs transition-colors cursor-pointer"
            title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Admin Portal Key Button */}
          <button
            onClick={() => setShowAdminModal(true)}
            className="p-2 rounded-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-2xs transition-colors cursor-pointer"
            title="Open Admin Portal (Backend Management)"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CHAPTER OVERVIEW DRAWER MODAL */}
      <AnimatePresence>
        {showOverviewDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowOverviewDrawer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[#ece5dd] shadow-2xl space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#ece5dd]">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#1a1615]">
                    Storybook Chapter Index
                  </h3>
                  <p className="text-xs text-gray-600 font-medium">
                    {homeContent.leftTag || "Sep 17, 2021 – Sep 17, 2026"} • 5 Years of Love
                  </p>
                </div>
                <button
                  onClick={() => setShowOverviewDrawer(false)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={(e) => jumpToPage(0, e)}
                  className={`p-3 rounded-2xl text-left border text-sm transition-all cursor-pointer flex items-center gap-3 ${
                    pageIndex === 0
                      ? "bg-red-100 border-red-500 font-semibold text-red-700"
                      : "bg-[#faf8f5] border-[#ece5dd] hover:border-red-400"
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold text-red-600 shadow-2xs">
                    00
                  </span>
                  <span className="font-medium text-gray-900">Story Cover</span>
                </button>

                {storyItems.map((item) => {
                  const unlocked = isPageUnlocked(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => jumpToPage(item.id, e)}
                      className={`p-3 rounded-2xl text-left border text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        pageIndex === item.id
                          ? "bg-red-100 border-red-500 font-semibold text-red-700"
                          : unlocked
                          ? "bg-[#faf8f5] border-[#ece5dd] hover:border-red-400"
                          : "bg-gray-100 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold text-red-600 shadow-2xs shrink-0">
                          {item.chapterNumber}
                        </span>
                        <div className="truncate">
                          <div className="font-medium text-xs text-gray-900 truncate">
                            {item.subTitle}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">{item.tag}</div>
                        </div>
                      </div>

                      {!unlocked && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    </button>
                  );
                })}

                <button
                  onClick={(e) => jumpToPage(finalePageIndex, e)}
                  className={`p-3 rounded-2xl text-left border text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    pageIndex === finalePageIndex
                      ? "bg-red-100 border-red-500 font-semibold text-red-700"
                      : isPageUnlocked(finalePageIndex)
                      ? "bg-[#faf8f5] border-[#ece5dd] hover:border-red-400"
                      : "bg-gray-100 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold text-red-600 shadow-2xs">
                      15
                    </span>
                    <span className="font-medium text-xs text-gray-900">
                      Finale • Wax Seal Letter
                    </span>
                  </div>
                  {!isPageUnlocked(finalePageIndex) && (
                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN BACKEND MODAL */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAdminModal(false)}
          >
            <div className="w-full max-w-5xl my-8" onClick={(e) => e.stopPropagation()}>
              <AdminPortal
                storyItems={storyItems}
                letterContent={letterContent}
                homeContent={homeContent}
                onUpdateData={handleAdminUpdateData}
                onClose={() => setShowAdminModal(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN 3D BOOK STAGE CONTAINER */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col justify-center items-center">
        <BookPageFlip pageKey={pageIndex} direction={direction}>
          {/* ========================================================================= */}
          {/* PAGE 0: LANDING COVER (DYNAMICALLY CUSTOMIZABLE VIA ADMIN PORTAL)          */}
          {/* ========================================================================= */}
          {pageIndex === 0 && (
            <div className="w-full bg-[#fffcf8] rounded-3xl border-2 border-[#e8a5b2]/40 book-card-shadow p-6 sm:p-12 text-center flex flex-col items-center justify-center my-auto min-h-[580px] relative overflow-hidden">
              {/* Top Date Accents */}
              <div className="absolute top-4 left-6 flex items-center gap-1.5 text-lg select-none opacity-90">
                <span>🌸</span>
                <span>🌹</span>
                <span className="text-xs font-serif italic text-red-700 font-bold hidden sm:inline">
                  {homeContent.leftTag || "Sep 17, 2021 – Sep 17, 2026"}
                </span>
              </div>

              <div className="absolute top-4 right-6 flex items-center gap-1.5 text-lg select-none opacity-90">
                <span className="text-xs font-serif italic text-red-700 font-bold hidden sm:inline">
                  {homeContent.rightTag || "5th Anniversary"}
                </span>
                <span>🌹</span>
                <span>🌸</span>
              </div>

              {/* Milestone Pill */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>{homeContent.badgeText || "5th Anniversary • September 17, 2021 – 2026 🌹"}</span>
              </motion.div>

              {/* Main Headline (DARK COLORS FOR HOME PAGE TEXT AS REQUESTED) */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1a1615] max-w-2xl leading-[1.06] mb-3 drop-shadow-2xs"
              >
                {homeContent.mainTitle || "14 Chapters of"}{" "}
                <span className="italic font-serif text-red-700 font-normal">
                  {homeContent.titleHighlight || "Us."}
                </span>
              </motion.h1>

              {/* Subtitle in Dark Color */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-xl text-[#2c2825] font-sans font-semibold max-w-xl leading-relaxed mb-8"
              >
                {homeContent.subtitle || "Started on September 17, 2021. Every glance, bus ride, and quiet moment brought us to 5 beautiful years."}
              </motion.p>

              {/* 3D Animated Love Heart Symbol Emblem Graphic */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="relative w-56 h-48 sm:w-64 sm:h-56 my-2 flex items-center justify-center group animate-heartbeat cursor-pointer"
                onClick={(e) => goToNextPage(e)}
              >
                {/* Glowing Heart Ambient Aura */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 200 180" className="w-full h-full text-red-500/30 blur-xl group-hover:blur-2xl transition-all">
                    <path
                      d="M 100 165 C 20 100, 0 45, 50 15 C 80 -5, 100 25, 100 25 C 100 25, 120 -5, 150 15 C 200 45, 180 100, 100 165 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Main 3D Heart Container */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-2xl">
                    <defs>
                      <linearGradient id="emblemHeartGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                        <stop offset="0%" stopColor="#ff4d6d" />
                        <stop offset="45%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#800020" />
                      </linearGradient>
                    </defs>

                    {/* Main Heart Path */}
                    <path
                      d="M 100 165 C 20 100, 0 45, 50 15 C 80 -5, 100 25, 100 25 C 100 25, 120 -5, 150 15 C 200 45, 180 100, 100 165 Z"
                      fill="url(#emblemHeartGrad)"
                      stroke="rgba(255, 255, 255, 0.7)"
                      strokeWidth="2.5"
                    />

                    {/* Top Left Gloss Sheen Highlight for 3D depth */}
                    <path
                      d="M 45 22 C 30 38, 28 58, 42 42 C 55 30, 70 18, 45 22 Z"
                      fill="white"
                      opacity="0.45"
                    />

                    {/* Soft ambient highlight curve */}
                    <path
                      d="M 140 25 C 160 40, 160 65, 140 50 C 130 40, 115 30, 140 25 Z"
                      fill="white"
                      opacity="0.2"
                    />
                  </svg>

                  {/* Text & Icon overlay inside the 3D Heart */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pt-4 text-white pointer-events-none space-y-1">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-inner mb-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-sm sm:text-base font-bold tracking-wide drop-shadow-md text-white">
                      {homeContent.cardTitle || "The Illustrated Diary"}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-medium text-red-100 max-w-[140px] leading-tight drop-shadow-xs">
                      {homeContent.cardSubtitle || "14 Memory Pages • Sealed Note"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Red Heart Action Button */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 relative flex flex-col items-center justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={(e) => goToNextPage(e)}
                  className="relative z-10 group flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-sans font-bold text-lg shadow-xl border-2 border-white/80 transition-all cursor-pointer animate-heartbeat"
                  title="Click to Open Our Storybook ❤️"
                >
                  <Heart className="w-6 h-6 fill-white stroke-none animate-pulse" />
                  <span className="tracking-wide">{homeContent.buttonText || "Open Storybook"}</span>
                  <ChevronRight className="w-5 h-5 text-white/90 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGES 1 to 14: STORY CHAPTER CARDS WITH PNG & Q&A UNLOCK MECHANISM        */}
          {/* ========================================================================= */}
          {currentChapterItem && (
            <div className="w-full bg-white rounded-3xl border border-[#ece5dd] book-card-shadow p-6 sm:p-10 flex flex-col justify-between my-auto min-h-[580px] relative overflow-hidden">
              {/* Top Chapter Tag Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#ece5dd]/80 mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-300">
                    Chapter {currentChapterItem.chapterNumber} of {storyItems.length}
                  </span>
                  <span className="text-xs font-serif italic text-gray-600 font-semibold hidden sm:inline">
                    {currentChapterItem.tag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentChapterUnlocked ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked Quiz</span>
                    </span>
                  )}
                  <span className="text-xs font-mono text-red-600 font-bold ml-1">
                    Page {currentChapterItem.id} / {storyItems.length}
                  </span>
                </div>
              </div>

              {/* Main Grid: Polaroid Frame (PNG Image, NO Cropping) + Narrative & Quiz */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center my-auto">
                {/* Polaroid Frame Image View */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="polaroid-frame relative bg-white p-4 rounded-2xl border border-[#ece5dd] shadow-lg group overflow-hidden"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-red-100/90 backdrop-blur-xs border border-red-300 transform -rotate-1 shadow-2xs z-10" />

                  {/* Image container using object-contain to ensure PNG photos are NOT cropped */}
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#faf7f2] p-1 border border-[#ece5dd]/60 flex items-center justify-center">
                    <Image
                      src={currentChapterItem.src}
                      alt={currentChapterItem.subTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide">
                      {currentChapterItem.tag}
                    </div>
                  </div>
                </motion.div>

                {/* Narrative Text + Quiz Unlock Box */}
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1615] mb-3 leading-tight">
                      {currentChapterItem.subTitle}
                    </h2>

                    <p className="text-base sm:text-lg text-gray-700 font-sans font-light leading-relaxed">
                      {currentChapterItem.text}
                    </p>
                  </div>

                  {/* Q&A Quiz Unlock Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#fffcf7] to-[#fcf6ee] border border-amber-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span>Chapter Unlock Question</span>
                      </div>
                      {currentChapterUnlocked && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Correct! Next unlocked ✨
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                      {currentChapterItem.question || "What special memory happened on this page?"}
                    </p>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userAnswers[currentChapterItem.id] || ""}
                          onChange={(e) =>
                            setUserAnswers((prev) => ({
                              ...prev,
                              [currentChapterItem.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCheckAnswer(currentChapterItem.id);
                          }}
                          placeholder="Type answer to unlock next..."
                          className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                        <button
                          onClick={() => handleCheckAnswer(currentChapterItem.id)}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Submit
                        </button>
                      </div>

                      {quizErrors[currentChapterItem.id] && (
                        <div className="text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-bounce">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{quizErrors[currentChapterItem.id]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Navigation Action Bar */}
              <div className="pt-6 border-t border-[#ece5dd]/80 flex items-center justify-between mt-6">
                {/* Previous Button */}
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => goToPrevPage(e)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f4efea] hover:bg-[#e5ded4] text-xs font-semibold text-gray-700 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </motion.button>

                {/* Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {storyItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={(e) => jumpToPage(item.id, e)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentChapterItem.id === item.id
                          ? "w-6 bg-red-600"
                          : isPageUnlocked(item.id)
                          ? "w-2 bg-red-600/40 hover:bg-red-600"
                          : "w-2 bg-gray-300 opacity-50"
                      }`}
                      title={`Page ${item.id}`}
                    />
                  ))}
                </div>

                {/* Next Button with Lock state shake */}
                <motion.button
                  animate={shakeLock ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => goToNextPage(e)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-semibold shadow-md transition-all cursor-pointer ${
                    currentChapterUnlocked
                      ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                      : "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                  }`}
                >
                  {!currentChapterUnlocked && <Lock className="w-3.5 h-3.5 text-white/90" />}
                  <span>
                    {currentChapterItem.id === storyItems.length
                      ? "Unlock Finale Seal"
                      : "Next Chapter"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE 15 (FINALE): SPECIAL SEALED NOTE PAGE WITH WAX SEAL ANIMATION        */}
          {/* ========================================================================= */}
          {pageIndex === finalePageIndex && (
            <div className="w-full bg-white rounded-3xl border border-[#ece5dd] book-card-shadow p-6 sm:p-10 flex flex-col justify-between my-auto min-h-[580px]">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#ece5dd]/80 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-300">
                    Chapter 15 Finale
                  </span>
                  <span className="text-xs font-serif italic text-gray-600">
                    {homeContent.leftTag || "Sep 17, 2021 – Sep 17, 2026"}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => jumpToPage(1, e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf8f5] border border-[#ece5dd] text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Re-read Story</span>
                </motion.button>
              </div>

              {/* Body: Wax Seal or Read-only Letter */}
              <div className="my-auto">
                {!waxBroken ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 sm:p-12 rounded-3xl bg-[#faf6f0] border border-[#e5ded4] shadow-inner flex flex-col items-center text-center max-w-xl mx-auto"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold bg-red-100 px-3.5 py-1 rounded-full border border-red-300 mb-6">
                      <Lock className="w-3.5 h-3.5" />
                      <span>5th Anniversary Sealed Envelope</span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                      Break the Wax Seal
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mb-8 max-w-xs leading-relaxed font-medium">
                      Tap the wax stamp below to trigger romantic confetti and read our 5-year anniversary letter.
                    </p>

                    {/* 3D Heart Wax Seal Button */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={handleBreakWaxSeal}
                      className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center cursor-pointer group transition-transform filter drop-shadow-2xl"
                      title="Click to break the wax seal!"
                    >
                      <svg viewBox="0 0 200 180" className="w-full h-full">
                        <defs>
                          <linearGradient id="waxHeartGrad" x1="15%" y1="10%" x2="85%" y2="90%">
                            <stop offset="0%" stopColor="#ff4d6d" />
                            <stop offset="45%" stopColor="#c45b73" />
                            <stop offset="100%" stopColor="#7a2b3a" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 100 165 C 20 100, 0 45, 50 15 C 80 -5, 100 25, 100 25 C 100 25, 120 -5, 150 15 C 200 45, 180 100, 100 165 Z"
                          fill="url(#waxHeartGrad)"
                          stroke="rgba(255,255,255,0.7)"
                          strokeWidth="3"
                        />
                        {/* 3D Gloss highlight */}
                        <path
                          d="M 45 22 C 30 38, 28 58, 42 42 C 55 30, 70 18, 45 22 Z"
                          fill="white"
                          opacity="0.45"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none pb-2">
                        <Heart className="w-7 h-7 fill-white/90 stroke-none mb-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-serif font-bold tracking-wider uppercase opacity-95">
                          5 Years
                        </span>
                      </div>
                    </motion.button>
                  </motion.div>
                ) : (
                  /* Formatted Letter Display */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-[#fffcf8] border border-[#e5ded4] rounded-3xl p-6 sm:p-10 shadow-md text-left"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#e5ded4] mb-4">
                      <div className="flex items-center gap-2">
                        <Feather className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-red-600">
                          Personal Note • Sep 17, 2021 – 2026
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                        Unlocked ❤️
                      </span>
                    </div>

                    <div className="space-y-4 font-serif text-base sm:text-lg text-gray-900 leading-relaxed p-4 rounded-2xl bg-[#faf6f0] border border-[#e5ded4]/80 mb-4 whitespace-pre-line">
                      {letterContent}
                    </div>

                    <div className="pt-3 border-t border-[#e5ded4] flex flex-wrap items-center justify-between gap-3">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleCopyLetter}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#ece5dd] text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer shadow-2xs"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Letter</span>
                          </>
                        )}
                      </motion.button>

                      <button
                        onClick={() => setWaxBroken(false)}
                        className="text-xs text-gray-600 hover:text-red-600 underline font-medium transition-colors cursor-pointer"
                      >
                        Fold Letter Envelope
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer navigation */}
              <div className="pt-6 border-t border-[#ece5dd]/80 flex items-center justify-between mt-6">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => goToPrevPage(e)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f4efea] hover:bg-[#e5ded4] text-xs font-semibold text-gray-700 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => jumpToPage(0, e)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <span>Back to Cover</span>
                  <RotateCw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </BookPageFlip>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-4 text-center text-xs text-gray-600 border-t border-[#ece5dd]/60 bg-white/60 backdrop-blur-xs">
        <p className="font-serif italic text-sm text-red-700 font-semibold">
          September 17, 2021 – September 17, 2026 • 5 Years & Forever to Go ❤️
        </p>
      </footer>
    </div>
  );
}

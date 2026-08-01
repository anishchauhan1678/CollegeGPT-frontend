import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Megaphone, ArrowRight } from "lucide-react";
import { Notice } from "../types";

interface ToastItem {
  id: string;
  notice: Notice;
}

interface NoticeToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
  onViewNotice: (notice: Notice) => void;
}

export function NoticeToastContainer({ toasts, onClose, onViewNotice }: NoticeToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[420px] px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <NoticeToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={onClose} 
            onViewNotice={onViewNotice} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface NoticeToastItemProps {
  key?: string;
  toast: ToastItem;
  onClose: (id: string) => void;
  onViewNotice: (notice: Notice) => void;
}

function NoticeToastItem({ toast, onClose, onViewNotice }: NoticeToastItemProps) {
  const { notice } = toast;
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const duration = 8000; // 8 seconds
  const timeLeft = useRef(duration);
  const lastTick = useRef(Date.now());

  useEffect(() => {
    lastTick.current = Date.now();
    const timer = setInterval(() => {
      if (!isHovered) {
        const now = Date.now();
        const delta = now - lastTick.current;
        timeLeft.current = Math.max(0, timeLeft.current - delta);
        setProgress((timeLeft.current / duration) * 100);
        
        if (timeLeft.current <= 0) {
          onClose(toast.id);
        }
      }
      lastTick.current = Date.now();
    }, 100);

    return () => clearInterval(timer);
  }, [isHovered, onClose, toast.id]);

  // Adjust lastTick when hover state changes so delta is accurate
  useEffect(() => {
    lastTick.current = Date.now();
  }, [isHovered]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.9, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-auto relative overflow-hidden rounded-2xl bg-[#0b0d19]/95 backdrop-blur-xl border border-pink-500/30 p-4 shadow-[0_8px_32px_rgba(244,63,94,0.15)] flex flex-col gap-3 w-full group"
    >
      {/* Blinking Top Red Glow bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-pink-500 animate-pulse" />

      {/* Header Info */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 shrink-0 relative">
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500" />
          <Megaphone className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-grow pr-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-pink-500/10 border border-pink-400/20 text-pink-400">
              URGENT NOTICE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-slate-400">
              {notice.category}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-auto">
              {notice.date}
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-100 mt-1.5 truncate group-hover:text-pink-400 transition-colors duration-200">
            {notice.title}
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {notice.content}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(toast.id)}
          className="absolute top-3 right-3 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action footer */}
      <div className="flex justify-between items-center bg-white/[0.02] -mx-4 -mb-4 p-3 border-t border-white/5 mt-1 shrink-0">
        <span className="text-[10px] font-mono text-slate-500">
          By: {notice.author}
        </span>
        <button
          onClick={() => onViewNotice(notice)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-xs font-semibold font-mono text-pink-400 tracking-wider uppercase transition-all duration-200 cursor-pointer"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Timer Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"
        style={{ width: `${progress}%` }}
      />
    </motion.div>
  );
}

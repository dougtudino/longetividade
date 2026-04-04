"use client";
import { useEffect, useState } from "react";

type CelebrationOverlayProps = {
  show: boolean;
  title: string;
  subtitle?: string;
  emoji: string;
  onClose: () => void;
};

export function CelebrationOverlay({
  show,
  title,
  subtitle,
  emoji,
  onClose,
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={() => {
        setVisible(false);
        onClose();
      }}
      style={{ backdropFilter: "blur(6px)" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Confetti dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 6 + Math.random() * 8,
              height: 6 + Math.random() * 8,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                "#639922",
                "#378ADD",
                "#FFC107",
                "#E53935",
                "#9C27B0",
                "#FF9800",
              ][i % 6],
              opacity: 0.7,
              animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      {/* Content card */}
      <div
        className="relative z-10 mx-8 rounded-3xl bg-white p-8 text-center shadow-2xl"
        style={{
          animation: "scaleIn 0.4s ease-out",
          maxWidth: 320,
        }}
      >
        <span className="text-6xl block mb-4">{emoji}</span>
        <h2 className="text-xl font-black text-gray-900 mb-2">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        <p className="mt-4 text-xs text-gray-400">Toque para fechar</p>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

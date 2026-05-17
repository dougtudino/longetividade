"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_SIZE = 22;

function IconJogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconEvolucao({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconMais({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// 3 abas só. Jogo (hero, centro) é a HQ. Evolução é o histórico completo.
// Mais é tudo o resto (perfil, notificações, como usar, receitas, sair).
// Páginas individuais (/app/desafio, /app/receitas) continuam acessíveis
// por links contextuais, mas não competem por espaço na nav.
export function AppNav() {
  const pathname = usePathname();

  const isJogo = pathname === "/app/home" || pathname === "/app";
  const isEvolucao = pathname.startsWith("/app/evolucao") || pathname.startsWith("/app/progresso") || pathname.startsWith("/app/conquistas");
  const isMais = pathname.startsWith("/app/mais") || pathname.startsWith("/app/perfil") || pathname.startsWith("/app/notificacoes") || pathname.startsWith("/app/como-usar") || pathname.startsWith("/app/receitas");

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 border-t border-gray-100 bg-white/95 backdrop-blur-sm"
      style={{ maxWidth: 430 }}
    >
      <style>{`
        @keyframes pulseHero {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,153,34,0.45); }
          50% { box-shadow: 0 0 0 8px rgba(99,153,34,0); }
        }
      `}</style>
      <div className="flex items-end justify-around pb-1">
        {/* Evolução */}
        <Link
          href="/app/evolucao"
          className="relative flex flex-col items-center gap-0.5 px-4 py-2 flex-1"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {isEvolucao && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full" style={{ width: 24, backgroundColor: "#639922" }} />
          )}
          <div className="flex items-center justify-center rounded-full transition-colors" style={{ width: 36, height: 36, backgroundColor: isEvolucao ? "#EAF3DE" : "transparent" }}>
            <IconEvolucao active={isEvolucao} />
          </div>
          <span className="text-[10px] font-medium" style={{ color: isEvolucao ? "#639922" : "#9ca3af" }}>
            Evolução
          </span>
        </Link>

        {/* Jogo (centro, destacado) */}
        <Link
          href="/app/home"
          className="relative flex flex-col items-center"
          style={{ WebkitTapHighlightColor: "transparent", marginTop: -18 }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #7BC34A 0%, #639922 50%, #3D5A3E 100%)",
              boxShadow: "0 6px 16px rgba(99,153,34,0.4)",
              animation: !isJogo ? "pulseHero 2.4s ease-in-out infinite" : "none",
              border: "3px solid white",
            }}
          >
            <IconJogo />
          </div>
          <span className="mt-1 text-[10px] font-black uppercase tracking-wider" style={{ color: isJogo ? "#3D5A3E" : "#639922" }}>
            Jogo
          </span>
        </Link>

        {/* Mais */}
        <Link
          href="/app/mais"
          className="relative flex flex-col items-center gap-0.5 px-4 py-2 flex-1"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {isMais && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full" style={{ width: 24, backgroundColor: "#639922" }} />
          )}
          <div className="flex items-center justify-center rounded-full transition-colors" style={{ width: 36, height: 36, backgroundColor: isMais ? "#EAF3DE" : "transparent" }}>
            <IconMais active={isMais} />
          </div>
          <span className="text-[10px] font-medium" style={{ color: isMais ? "#639922" : "#9ca3af" }}>
            Mais
          </span>
        </Link>
      </div>
    </nav>
  );
}

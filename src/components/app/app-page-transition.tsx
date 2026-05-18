"use client";
import { usePathname } from "next/navigation";

// Wrapper que envolve children e aplica fade-in suave em cada navegacao.
// Pathname como key força re-mount do nodo + dispara a animacao CSS.
// Sem libs extras (zero peso), sem JS — apenas CSS keyframes.
//
// Decisao: fade simples (200ms) em vez de slide horizontal porque:
// 1. Fade nao confunde direcao em navegacao nao-linear (abas, links contextuais)
// 2. Slide horizontal precisa saber "direction" (esquerda/direita), o que
//    em apps com abas + links contextuais nao tem semantica clara
// 3. Apps wellness premium (Calm, Headspace, Finch) usam fade, nao slide
export function AppPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="app-page-transition">
      {children}
      <style jsx>{`
        .app-page-transition {
          animation: appPageFade 220ms ease-out;
        }
        @keyframes appPageFade {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

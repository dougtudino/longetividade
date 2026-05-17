"use client";
import { useEffect, useState } from "react";

// Tipo do evento BeforeInstallPromptEvent (não está no TS DOM lib por padrão)
type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
};

type Platform = "android" | "ios" | "desktop" | "other";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/i.test(ua)) return "desktop";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export type InstallPwaButtonProps = {
  variant?: "primary" | "secondary"; // estilo visual
  hideWhenInstalled?: boolean; // default true
  label?: string; // texto custom
  className?: string;
  style?: React.CSSProperties;
};

// Botão multi-plataforma pra instalar o app como PWA.
//
// Comportamento:
//   • Android/Chrome/Edge: captura beforeinstallprompt e chama prompt() nativo
//   • iOS Safari: mostra modal com passo a passo (não dá pra chamar prompt programaticamente)
//   • Já instalado (standalone): esconde botão (a menos que hideWhenInstalled=false)
//   • Outros: esconde
export function InstallPwaButton({
  variant = "primary",
  hideWhenInstalled = true,
  label,
  className,
  style,
}: InstallPwaButtonProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Quando instala, dispara appinstalled
    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  // Esconder se já instalado (default)
  if (installed && hideWhenInstalled) return null;

  // Esconder em platforms onde não dá pra instalar
  if (platform === "other") return null;

  // Desktop/Android: só mostra se temos o prompt event capturado
  // (browser decide quando o evento dispara; PWA precisa cumprir
  // critérios: manifest, sw, HTTPS, etc — manifest e sw já temos)
  if ((platform === "android" || platform === "desktop") && !deferredPrompt) {
    return null;
  }

  async function handleClick() {
    if (platform === "ios") {
      setShowIosModal(true);
      return;
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
  }

  const buttonStyle: React.CSSProperties = variant === "primary"
    ? {
        background: "linear-gradient(135deg, #639922 0%, #3D5A3E 100%)",
        color: "white",
        ...style,
      }
    : {
        backgroundColor: "white",
        color: "#639922",
        border: "2px solid #639922",
        ...style,
      };

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ??
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-transform active:scale-[0.98]"
        }
        style={buttonStyle}
      >
        <span className="text-base">📲</span>
        <span>{label ?? "Instalar app no celular"}</span>
      </button>

      {/* Modal iOS */}
      {showIosModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60"
          onClick={() => setShowIosModal(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Instalar no iPhone</h3>
              <button
                onClick={() => setShowIosModal(false)}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-400"
              >
                ×
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600 leading-relaxed">
              No iPhone, instalar o app permite receber notificações e abrir direto sem o Safari.
              Siga os passos:
            </p>
            <ol className="mb-4 space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ backgroundColor: "#639922" }}
                >
                  1
                </span>
                <span>
                  Toque no botão <strong>Compartilhar</strong>{" "}
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-gray-300 align-middle">
                    <svg width="11" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 3 L12 16" />
                      <path d="M6 9 L12 3 L18 9" />
                      <rect x="4" y="15" width="16" height="6" rx="1" />
                    </svg>
                  </span>{" "}
                  na barra do Safari (□ com seta pra cima)
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ backgroundColor: "#639922" }}
                >
                  2
                </span>
                <span>
                  Role e toque em <strong>"Adicionar à Tela de Início"</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ backgroundColor: "#639922" }}
                >
                  3
                </span>
                <span>
                  Toque em <strong>Adicionar</strong> no canto superior direito
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
                  style={{ backgroundColor: "#639922" }}
                >
                  4
                </span>
                <span>
                  Feche o Safari e abra o app pelo <strong>ícone novo</strong> na tela inicial
                </span>
              </li>
            </ol>
            <div className="rounded-xl p-3" style={{ backgroundColor: "#EAF3DE" }}>
              <p className="text-xs" style={{ color: "#3B6D11" }}>
                💡 Depois de instalar, abra o app pelo ícone (não pelo Safari) e ative as notificações
                em <strong>Mais → Notificações</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowIosModal(false)}
              className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-gray-500"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

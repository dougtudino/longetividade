"use client";
import { useEffect, useState } from "react";

export function VipBanner() {
  const [slots, setSlots] = useState<{ total: number; used: number; available: number } | null>(null);

  useEffect(() => {
    fetch("/api/app/slots")
      .then((r) => r.json())
      .then(setSlots)
      .catch(() => {});
  }, []);

  if (!slots) return null;

  const urgent = slots.available <= 20;
  const esgotado = slots.available <= 0;
  const pct = (slots.used / slots.total) * 100;

  return (
    <div
      className="mt-10 md:mt-14 mx-auto max-w-xl rounded-2xl border-2 p-6 md:p-8"
      style={{
        borderColor: esgotado ? "#d1d5db" : urgent ? "#BA7517" : "#639922",
        backgroundColor: esgotado ? "#f9fafb" : urgent ? "#fef3c7" : "#EAF3DE",
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-3xl">{esgotado ? "🔒" : "📱"}</span>
        <div>
          <h3
            className="font-bold text-lg"
            style={{ color: esgotado ? "#6b7280" : urgent ? "#92400e" : "#3B6D11" }}
          >
            App de Acompanhamento — Acesso Vitalicio
          </h3>
          <p className="text-sm" style={{ color: esgotado ? "#9ca3af" : urgent ? "#a16207" : "#4d7c0f" }}>
            {esgotado
              ? "Vagas esgotadas — app nao incluso neste momento"
              : "Os primeiros 100 compradores do plano VIP ganham acesso vitalicio ao app. Apos esgotar, sera vendido por R$27/mes."}
          </p>
        </div>
      </div>

      {!esgotado && (
        <>
          {/* Barra de progresso */}
          <div className="h-3 w-full rounded-full bg-white/60 mb-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: urgent ? "#BA7517" : "#639922",
              }}
            />
          </div>
          <p
            className="text-center text-sm font-bold"
            style={{ color: urgent ? "#92400e" : "#3B6D11" }}
          >
            {slots.available} vagas restantes de {slots.total}
          </p>
        </>
      )}
    </div>
  );
}

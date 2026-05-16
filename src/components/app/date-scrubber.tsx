"use client";
import { useMemo } from "react";

// Devolve YYYY-MM-DD (UTC) — mesmo formato usado pelos endpoints com ?date=
function toIsoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function shiftDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export type DateScrubberProps = {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  daysVisible?: number; // default 7
};

// Scrubber horizontal de N dias terminando hoje. Dia selecionado destacado.
// Click em dia futuro nao faz nada (visualmente bloqueado). Click no botao
// "hoje" volta pro dia atual.
export function DateScrubber({ selectedDate, onSelect, daysVisible = 7 }: DateScrubberProps) {
  const today = useMemo(() => toIsoDate(new Date()), []);
  const days = useMemo(() => {
    const now = new Date(today + "T00:00:00Z");
    const out: Array<{ iso: string; weekday: string; dayNumber: number; isToday: boolean }> = [];
    for (let i = daysVisible - 1; i >= 0; i--) {
      const d = shiftDays(now, -i);
      out.push({
        iso: toIsoDate(d),
        weekday: d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" }).slice(0, 3),
        dayNumber: d.getUTCDate(),
        isToday: toIsoDate(d) === today,
      });
    }
    return out;
  }, [today, daysVisible]);

  const isPast = selectedDate !== today;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {isPast ? "Vendo passado" : "Hoje"}
        </p>
        {isPast && (
          <button
            onClick={() => onSelect(today)}
            className="rounded-full px-3 py-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: "#639922" }}
          >
            Voltar pra hoje
          </button>
        )}
      </div>
      <div className="flex justify-between gap-1">
        {days.map((d) => {
          const selected = d.iso === selectedDate;
          return (
            <button
              key={d.iso}
              onClick={() => onSelect(d.iso)}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-all"
              style={{
                backgroundColor: selected ? "#639922" : "transparent",
                color: selected ? "white" : d.isToday ? "#639922" : "#9ca3af",
                border: selected
                  ? "none"
                  : d.isToday
                    ? "1px solid #639922"
                    : "1px solid #e5e7eb",
              }}
            >
              <span className="text-[10px] font-bold uppercase">{d.weekday}</span>
              <span className="text-base font-black">{d.dayNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

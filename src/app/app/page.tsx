"use client";
import { useEffect } from "react";

export default function AppIndex() {
  useEffect(() => {
    // Verificar se esta autenticado e redirecionar
    fetch("/api/app/profile")
      .then((r) => {
        if (!r.ok) {
          window.location.href = "/app/login";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.profile?.onboardingDone) {
          window.location.href = "/app/home";
        } else {
          window.location.href = "/app/onboarding";
        }
      })
      .catch(() => {
        window.location.href = "/app/login";
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#639922] border-t-transparent" />
    </div>
  );
}

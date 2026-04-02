"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppIndex() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se esta autenticado
    fetch("/api/app/profile")
      .then((r) => {
        if (!r.ok) {
          router.replace("/app/login");
          return;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (!data.profile?.onboardingDone) {
          router.replace("/app/onboarding");
        } else {
          router.replace("/app/home");
        }
      })
      .catch(() => router.replace("/app/login"));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#639922] border-t-transparent" />
    </div>
  );
}

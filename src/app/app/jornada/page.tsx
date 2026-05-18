// Placeholder — sera substituido pela timeline unificada no PR13b.
// Por enquanto redireciona pra /app/evolucao pra nao quebrar UX.
import { redirect } from "next/navigation";

export default function JornadaPage() {
  redirect("/app/evolucao");
}

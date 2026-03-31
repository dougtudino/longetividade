export function Footer() {
  return (
    <footer className="py-10" style={{backgroundColor: 'var(--bg-primary)'}}>
      <div className="mx-auto max-w-5xl px-4 text-center">
        <p className="font-heading font-bold text-white/70 text-lg mb-4">
          Emagreca sem Dieta
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-white/50 font-body text-sm mb-6">
          <a href="/politica-de-privacidade" className="hover:text-white/80 transition-colors">
            Politica de Privacidade
          </a>
          <span>|</span>
          <a href="/termos-de-uso" className="hover:text-white/80 transition-colors">
            Termos de Uso
          </a>
          <span>|</span>
          <a href="mailto:contato@longetividade.com.br" className="hover:text-white/80 transition-colors">
            Contato
          </a>
        </div>

        <p className="font-body text-white/40 text-xs leading-relaxed max-w-lg mx-auto mb-4">
          Este produto nao substitui acompanhamento medico ou nutricional.
          Resultados variam de pessoa para pessoa.
        </p>

        <p className="font-body text-white/30 text-xs">
          2026 Emagreca sem Dieta. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

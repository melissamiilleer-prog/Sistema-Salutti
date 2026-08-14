interface LogoProps {
  className?: string
}

/**
 * Reproduz o lockup textual do logotipo do site institucional: o ícone
 * oficial (fita verde em forma de "S" + martelo dourado atravessado,
 * arquivo em /public/brand/icone-salutti.png, com fundo removido) ao lado
 * do texto "SALUTTI" na cor e fonte exatas do logo.
 */
export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={`${import.meta.env.BASE_URL}brand/icone-salutti.png`} alt="" className="h-8 w-auto" />
      <span className="font-body text-lg font-extrabold uppercase tracking-tight text-brandGreen">
        SALUTTI
      </span>
    </div>
  )
}

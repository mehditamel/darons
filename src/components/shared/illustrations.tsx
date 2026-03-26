import { cn } from "@/lib/utils";

interface IllustrationProps {
  size?: number;
  className?: string;
}

export function IllustrationDocuments({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* Folder */}
      <rect x="20" y="35" width="80" height="60" rx="6" className="stroke-warm-orange" strokeWidth="2" fill="none" />
      <path d="M20 41 L20 35 C20 32 22 30 25 30 L50 30 L56 35 L95 35" className="stroke-warm-orange" strokeWidth="2" fill="none" />
      {/* Document 1 */}
      <rect x="35" y="50" width="30" height="38" rx="3" className="stroke-warm-teal" strokeWidth="1.5" fill="none" opacity="0.7" />
      <line x1="41" y1="58" x2="59" y2="58" className="stroke-warm-teal" strokeWidth="1.5" opacity="0.4" />
      <line x1="41" y1="64" x2="55" y2="64" className="stroke-warm-teal" strokeWidth="1.5" opacity="0.4" />
      <line x1="41" y1="70" x2="57" y2="70" className="stroke-warm-teal" strokeWidth="1.5" opacity="0.4" />
      {/* Document 2 (offset) */}
      <rect x="55" y="45" width="30" height="38" rx="3" className="stroke-warm-blue" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Checkmark */}
      <circle cx="85" cy="78" r="10" className="fill-warm-green/20 stroke-warm-green" strokeWidth="1.5" />
      <path d="M80 78 L83 81 L90 74" className="stroke-warm-green" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IllustrationVaccin({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* Syringe body */}
      <rect x="45" y="25" width="16" height="55" rx="3" className="stroke-warm-teal" strokeWidth="2" fill="none" />
      {/* Plunger */}
      <line x1="53" y1="15" x2="53" y2="30" className="stroke-warm-teal" strokeWidth="2" strokeLinecap="round" />
      <line x1="47" y1="15" x2="59" y2="15" className="stroke-warm-teal" strokeWidth="2" strokeLinecap="round" />
      {/* Needle */}
      <line x1="53" y1="80" x2="53" y2="100" className="stroke-warm-teal" strokeWidth="1.5" strokeLinecap="round" />
      {/* Measurement lines */}
      <line x1="47" y1="40" x2="52" y2="40" className="stroke-warm-teal" strokeWidth="1" opacity="0.5" />
      <line x1="47" y1="50" x2="52" y2="50" className="stroke-warm-teal" strokeWidth="1" opacity="0.5" />
      <line x1="47" y1="60" x2="52" y2="60" className="stroke-warm-teal" strokeWidth="1" opacity="0.5" />
      {/* Heart */}
      <path d="M80 45 C80 40 85 36 89 40 C93 36 98 40 98 45 C98 52 89 58 89 58 C89 58 80 52 80 45Z" className="fill-warm-red/15 stroke-warm-red" strokeWidth="1.5" />
      {/* Shield */}
      <path d="M25 50 L25 38 L38 32 L38 44 C38 52 32 58 25 60 Z" className="fill-warm-teal/10 stroke-warm-teal" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

export function IllustrationBudget({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* Piggy bank body */}
      <ellipse cx="60" cy="65" rx="30" ry="25" className="stroke-warm-orange" strokeWidth="2" fill="none" />
      {/* Ear */}
      <ellipse cx="42" cy="48" rx="7" ry="9" className="stroke-warm-orange" strokeWidth="1.5" fill="none" />
      {/* Eye */}
      <circle cx="50" cy="58" r="2.5" className="fill-warm-orange" />
      {/* Snout */}
      <ellipse cx="35" cy="65" rx="8" ry="5" className="stroke-warm-orange" strokeWidth="1.5" fill="none" />
      <circle cx="33" cy="64" r="1.2" className="fill-warm-orange" opacity="0.5" />
      <circle cx="37" cy="64" r="1.2" className="fill-warm-orange" opacity="0.5" />
      {/* Legs */}
      <line x1="48" y1="88" x2="48" y2="98" className="stroke-warm-orange" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="72" y1="88" x2="72" y2="98" className="stroke-warm-orange" strokeWidth="2.5" strokeLinecap="round" />
      {/* Coin slot */}
      <line x1="55" y1="40" x2="65" y2="40" className="stroke-warm-gold" strokeWidth="2" strokeLinecap="round" />
      {/* Coins */}
      <circle cx="88" cy="38" r="8" className="fill-warm-gold/20 stroke-warm-gold" strokeWidth="1.5" />
      <text x="85" y="42" className="fill-warm-gold" fontSize="10" fontWeight="bold">€</text>
      <circle cx="96" cy="50" r="6" className="fill-warm-gold/10 stroke-warm-gold" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export function IllustrationJournal({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* Book */}
      <rect x="25" y="20" width="60" height="80" rx="4" className="stroke-warm-purple" strokeWidth="2" fill="none" />
      {/* Spine */}
      <line x1="35" y1="20" x2="35" y2="100" className="stroke-warm-purple" strokeWidth="1.5" opacity="0.4" />
      {/* Lines */}
      <line x1="42" y1="35" x2="75" y2="35" className="stroke-warm-purple" strokeWidth="1.5" opacity="0.3" />
      <line x1="42" y1="45" x2="70" y2="45" className="stroke-warm-purple" strokeWidth="1.5" opacity="0.3" />
      <line x1="42" y1="55" x2="73" y2="55" className="stroke-warm-purple" strokeWidth="1.5" opacity="0.3" />
      <line x1="42" y1="65" x2="65" y2="65" className="stroke-warm-purple" strokeWidth="1.5" opacity="0.3" />
      {/* Pencil */}
      <line x1="80" y1="70" x2="95" y2="30" className="stroke-warm-orange" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="95" y1="30" x2="97" y2="25" className="stroke-warm-gold" strokeWidth="2" strokeLinecap="round" />
      {/* Heart doodle */}
      <path d="M50 78 C50 75 53 73 55 75 C57 73 60 75 60 78 C60 82 55 85 55 85 C55 85 50 82 50 78Z" className="fill-warm-red/20 stroke-warm-red" strokeWidth="1" />
      {/* Star */}
      <path d="M70 75 L71.5 79 L76 79 L72.5 82 L73.8 86 L70 83.5 L66.2 86 L67.5 82 L64 79 L68.5 79Z" className="fill-warm-gold/20 stroke-warm-gold" strokeWidth="1" />
    </svg>
  );
}

export function IllustrationFiscal({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* Calculator body */}
      <rect x="30" y="20" width="50" height="75" rx="6" className="stroke-warm-gold" strokeWidth="2" fill="none" />
      {/* Screen */}
      <rect x="36" y="27" width="38" height="16" rx="2" className="fill-warm-gold/10 stroke-warm-gold" strokeWidth="1" />
      <text x="60" y="39" className="fill-warm-gold" fontSize="10" fontWeight="bold" textAnchor="middle">3 850€</text>
      {/* Button grid */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={38 + col * 12}
            y={50 + row * 11}
            width={9}
            height={8}
            rx={1.5}
            className="stroke-warm-gold"
            strokeWidth="1"
            fill="none"
            opacity={0.4}
          />
        ))
      )}
      {/* Trending arrow */}
      <path d="M88 65 L98 45 L92 45 L92 30" className="stroke-warm-green" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M95 48 L98 45 L101 48" className="stroke-warm-green" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Euro coin */}
      <circle cx="95" cy="80" r="10" className="fill-warm-gold/15 stroke-warm-gold" strokeWidth="1.5" />
      <text x="91.5" y="85" className="fill-warm-gold" fontSize="13" fontWeight="bold">€</text>
    </svg>
  );
}

export function IllustrationGarde({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* House */}
      <path d="M60 20 L90 45 L90 90 L30 90 L30 45 Z" className="stroke-warm-blue" strokeWidth="2" fill="none" />
      {/* Roof accent */}
      <path d="M60 20 L90 45 L30 45 Z" className="fill-warm-blue/10" />
      {/* Door */}
      <rect x="50" y="65" width="20" height="25" rx="2" className="stroke-warm-blue" strokeWidth="1.5" fill="none" />
      <circle cx="66" cy="78" r="1.5" className="fill-warm-blue" />
      {/* Window */}
      <rect x="36" y="52" width="14" height="12" rx="1" className="stroke-warm-blue" strokeWidth="1.5" fill="none" />
      <line x1="43" y1="52" x2="43" y2="64" className="stroke-warm-blue" strokeWidth="1" opacity="0.5" />
      <line x1="36" y1="58" x2="50" y2="58" className="stroke-warm-blue" strokeWidth="1" opacity="0.5" />
      {/* Child figure */}
      <circle cx="98" cy="60" r="6" className="stroke-warm-orange" strokeWidth="1.5" fill="none" />
      <line x1="98" y1="66" x2="98" y2="82" className="stroke-warm-orange" strokeWidth="1.5" />
      <line x1="92" y1="73" x2="104" y2="73" className="stroke-warm-orange" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="98" y1="82" x2="93" y2="95" className="stroke-warm-orange" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="98" y1="82" x2="103" y2="95" className="stroke-warm-orange" strokeWidth="1.5" strokeLinecap="round" />
      {/* Heart */}
      <path d="M18 55 C18 52 21 50 23 52 C25 50 28 52 28 55 C28 59 23 62 23 62 C23 62 18 59 18 55Z" className="fill-warm-red/20 stroke-warm-red" strokeWidth="1" />
    </svg>
  );
}

export function IllustrationActivites({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* Ball */}
      <circle cx="45" cy="70" r="20" className="stroke-warm-orange" strokeWidth="2" fill="none" />
      <path d="M30 58 Q45 75 60 58" className="stroke-warm-orange" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M30 82 Q45 65 60 82" className="stroke-warm-orange" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Palette */}
      <ellipse cx="85" cy="45" rx="18" ry="14" className="stroke-warm-purple" strokeWidth="2" fill="none" transform="rotate(-15, 85, 45)" />
      <circle cx="78" cy="38" r="3" className="fill-warm-red" opacity="0.6" />
      <circle cx="86" cy="35" r="3" className="fill-warm-blue" opacity="0.6" />
      <circle cx="93" cy="39" r="3" className="fill-warm-green" opacity="0.6" />
      <circle cx="88" cy="48" r="3" className="fill-warm-gold" opacity="0.6" />
      {/* Music note */}
      <path d="M80 75 L80 60 L92 57 L92 72" className="stroke-warm-teal" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="77" cy="77" r="4" className="fill-warm-teal/30 stroke-warm-teal" strokeWidth="1.5" />
      <circle cx="89" cy="74" r="4" className="fill-warm-teal/30 stroke-warm-teal" strokeWidth="1.5" />
      {/* Stars */}
      <path d="M25 30 L26.5 34 L31 34 L27.5 37 L28.8 41 L25 38.5 L21.2 41 L22.5 37 L19 34 L23.5 34Z" className="fill-warm-gold/30 stroke-warm-gold" strokeWidth="1" />
    </svg>
  );
}

export function IllustrationDeveloppement({ size = 120, className }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn("animate-fade-in-up", className)}>
      {/* Growth chart */}
      <line x1="25" y1="95" x2="95" y2="95" className="stroke-warm-purple" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="95" x2="25" y2="25" className="stroke-warm-purple" strokeWidth="2" strokeLinecap="round" />
      {/* Curve */}
      <path d="M25 90 Q40 85 50 70 Q60 55 70 48 Q80 40 95 30" className="stroke-warm-teal" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Data points */}
      <circle cx="35" cy="85" r="3" className="fill-warm-teal/30 stroke-warm-teal" strokeWidth="1.5" />
      <circle cx="50" cy="70" r="3" className="fill-warm-teal/30 stroke-warm-teal" strokeWidth="1.5" />
      <circle cx="70" cy="48" r="3" className="fill-warm-teal/30 stroke-warm-teal" strokeWidth="1.5" />
      <circle cx="90" cy="32" r="3" className="fill-warm-teal/30 stroke-warm-teal" strokeWidth="1.5" />
      {/* Star at top */}
      <path d="M95 22 L96.8 27 L102 27 L98 30 L99.4 35 L95 32 L90.6 35 L92 30 L88 27 L93.2 27Z" className="fill-warm-gold/40 stroke-warm-gold" strokeWidth="1" />
      {/* Little footprints */}
      <ellipse cx="38" cy="55" rx="3" ry="4.5" className="fill-warm-purple/20" transform="rotate(-20, 38, 55)" />
      <ellipse cx="48" cy="42" rx="3" ry="4.5" className="fill-warm-purple/20" transform="rotate(-10, 48, 42)" />
    </svg>
  );
}

export const ILLUSTRATION_MAP: Record<string, React.FC<IllustrationProps>> = {
  identite: IllustrationDocuments,
  documents: IllustrationDocuments,
  vaccinations: IllustrationVaccin,
  sante: IllustrationVaccin,
  budget: IllustrationBudget,
  journal: IllustrationJournal,
  fiscal: IllustrationFiscal,
  garde: IllustrationGarde,
  activites: IllustrationActivites,
  scolarite: IllustrationActivites,
  developpement: IllustrationDeveloppement,
};

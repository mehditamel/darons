import Image from "next/image";
import { Sun } from "lucide-react";

interface FamilyWelcomeProps {
  title: string;
  description: string;
  date?: string;
}

export function FamilyWelcome({
  title,
  description,
  date,
}: FamilyWelcomeProps) {
  return (
    <div className="family-welcome family-enter">
      <div className="family-welcome-copy">
        <p className="family-eyebrow">
          <Sun aria-hidden="true" className="h-4 w-4" />
          {date ?? "Bienvenue dans votre espace"}
        </p>
        <h1>{title}</h1>
        <p className="family-welcome-description">{description}</p>
      </div>
      <div className="family-welcome-photo" aria-hidden="true">
        <Image
          src="/images/family/breakfast.webp"
          alt=""
          fill
          sizes="(min-width: 640px) 230px, 1px"
          className="object-cover"
        />
        <span>La vie, ensemble.</span>
      </div>
    </div>
  );
}

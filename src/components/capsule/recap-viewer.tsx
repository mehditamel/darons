import { Card, CardContent } from "@/components/ui/card";
import { BookHeart, Sparkles, Heart, Activity, Calendar, BarChart3 } from "lucide-react";
import type { CapsuleContent, CapsuleSection } from "@/types/capsule";

interface Props {
  content: CapsuleContent;
}

const SECTION_ICONS: Record<CapsuleSection["kind"], typeof BookHeart> = {
  jalons: Sparkles,
  sante: Activity,
  moments: Heart,
  premieres_fois: Sparkles,
  chiffres: BarChart3,
};

export function RecapViewer({ content }: Props) {
  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      <header className="text-center py-8 border-b">
        <div className="inline-flex h-14 w-14 rounded-full bg-warm-purple/10 text-warm-purple items-center justify-center mb-3">
          <BookHeart className="h-7 w-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          {content.title}
        </h1>
        {content.intro && (
          <p className="mt-3 text-lg text-muted-foreground italic leading-relaxed">
            {content.intro}
          </p>
        )}
      </header>

      {content.stats && Object.keys(content.stats).length > 0 && (
        <Card className="bg-warm-purple/5 border-warm-purple/20">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(content.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-serif font-bold text-warm-purple">
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">
                    {key.replace(/_/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {content.sections.map((section, idx) => {
        const Icon = SECTION_ICONS[section.kind] ?? Calendar;
        return (
          <section key={idx} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-warm-purple/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-warm-purple" />
              </div>
              <h2 className="text-xl font-serif font-semibold">{section.title}</h2>
            </div>
            <ul className="space-y-2 pl-10">
              {section.items.map((item, i) => (
                <li key={i} className="text-base leading-relaxed flex gap-2">
                  <span className="text-warm-purple shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {content.message_for_later && (
        <Card className="bg-gradient-to-br from-warm-purple/10 to-warm-orange/5 border-warm-purple/20">
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-wider text-warm-purple font-semibold mb-2">
              Pour toi, plus tard
            </div>
            <p className="text-lg font-serif italic leading-relaxed">
              {content.message_for_later}
            </p>
          </CardContent>
        </Card>
      )}
    </article>
  );
}

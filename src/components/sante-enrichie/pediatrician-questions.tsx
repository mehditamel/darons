"use client";

import { useState } from "react";
import { Plus, Trash2, Stethoscope, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PediatricianQuestionsProps {
  childName: string;
}

function getStorageKey(childName: string) {
  return `darons_pediatrician_questions_${childName}`;
}

function loadQuestions(childName: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(getStorageKey(childName));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQuestions(childName: string, questions: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(childName), JSON.stringify(questions));
}

export function PediatricianQuestions({ childName }: PediatricianQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>(() => loadQuestions(childName));
  const [newQuestion, setNewQuestion] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  function addQuestion() {
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    const updated = [...questions, trimmed];
    setQuestions(updated);
    saveQuestions(childName, updated);
    setNewQuestion("");
  }

  function removeQuestion(index: number) {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    saveQuestions(childName, updated);
  }

  async function copyAll() {
    if (questions.length === 0) return;
    const text = `Questions pour le pédiatre — ${childName}\n\n${questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copié !",
        description: "Les questions ont été copiées dans le presse-papier.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papier.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Stethoscope className="h-5 w-5 text-warm-teal" />
          Questions pour le pédiatre
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Note tes questions ici avant le prochain RDV. Tu pourras les copier pour les avoir sous la main.
        </p>

        <div className="flex gap-2">
          <Input
            placeholder="Ex : faut-il s'inquiéter pour les coliques ?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addQuestion()}
          />
          <Button size="icon" onClick={addQuestion} disabled={!newQuestion.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {questions.length > 0 ? (
          <>
            <ul className="space-y-2">
              {questions.map((question, index) => (
                <li
                  key={index}
                  className="flex items-start justify-between gap-2 rounded-lg border p-2"
                >
                  <span className="text-sm flex-1">
                    <span className="font-medium text-warm-teal mr-1.5">{index + 1}.</span>
                    {question}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" onClick={copyAll} className="w-full">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copier toutes les questions
                </>
              )}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune question pour le moment. Ajoute-en une ci-dessus !
          </p>
        )}
      </CardContent>
    </Card>
  );
}

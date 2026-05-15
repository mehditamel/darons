"use client";

import * as React from "react";
import { ToastAction } from "@/components/ui/toast";
import type { ToastActionElement } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { ERROR_CODES } from "@/lib/constants";

type ErrorCode = keyof typeof ERROR_CODES;

type FeedbackInput =
  | string
  | {
      title?: string;
      description?: string;
      durationMs?: number;
    };

type ErrorInput =
  | string
  | ErrorCode
  | {
      code?: ErrorCode;
      title?: string;
      description?: string;
      durationMs?: number;
    };

interface UndoOptions {
  title: string;
  description?: string;
  onUndo: () => void | Promise<void>;
  durationMs?: number;
}

function isErrorCode(value: string): value is ErrorCode {
  return value in ERROR_CODES;
}

function resolveFeedback(input: FeedbackInput, fallbackTitle: string) {
  if (typeof input === "string") {
    return { title: input || fallbackTitle, description: undefined as string | undefined, durationMs: undefined as number | undefined };
  }
  return {
    title: input.title ?? fallbackTitle,
    description: input.description,
    durationMs: input.durationMs,
  };
}

function resolveError(input: ErrorInput, fallbackTitle: string) {
  if (typeof input === "string") {
    if (isErrorCode(input)) {
      return { title: fallbackTitle, description: ERROR_CODES[input], durationMs: undefined as number | undefined };
    }
    return { title: input || fallbackTitle, description: undefined as string | undefined, durationMs: undefined as number | undefined };
  }
  const description =
    input.description ?? (input.code ? ERROR_CODES[input.code] : undefined);
  return {
    title: input.title ?? fallbackTitle,
    description,
    durationMs: input.durationMs,
  };
}

export function useActionFeedback() {
  const { toast } = useToast();

  const success = React.useCallback(
    (input: FeedbackInput) => {
      const { title, description, durationMs } = resolveFeedback(input, "C'est fait");
      return toast({
        variant: "success",
        title,
        description,
        duration: durationMs ?? 3500,
      });
    },
    [toast]
  );

  const error = React.useCallback(
    (input: ErrorInput) => {
      const { title, description, durationMs } = resolveError(input, "Oups, ça a bloqué");
      return toast({
        variant: "destructive",
        title,
        description,
        duration: durationMs ?? 6000,
      });
    },
    [toast]
  );

  const info = React.useCallback(
    (input: FeedbackInput) => {
      const { title, description, durationMs } = resolveFeedback(input, "Info");
      return toast({
        variant: "info",
        title,
        description,
        duration: durationMs ?? 4000,
      });
    },
    [toast]
  );

  const undo = React.useCallback(
    (options: UndoOptions) => {
      const { title, description, onUndo, durationMs = 5000 } = options;
      const actionElement = React.createElement(
        ToastAction,
        {
          altText: "Annuler l'action",
          onClick: () => {
            void onUndo();
          },
        },
        "Annuler"
      ) as unknown as ToastActionElement;
      return toast({
        variant: "default",
        title,
        description,
        duration: durationMs,
        action: actionElement,
      });
    },
    [toast]
  );

  return { success, error, info, undo };
}

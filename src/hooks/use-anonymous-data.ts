"use client";

import { useLocalStorage } from "./use-local-storage";
import { useCallback } from "react";

const NUDGE_THRESHOLD = 3;

interface AnonymousState<T> {
  data: T;
  actionCount: number;
}

export function useAnonymousData<T>(toolId: string, initialData: T) {
  const [state, setState] = useLocalStorage<AnonymousState<T>>(
    `darons_tool_${toolId}`,
    { data: initialData, actionCount: 0 }
  );

  const setData = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => ({
        data: updater instanceof Function ? updater(prev.data) : updater,
        actionCount: prev.actionCount + 1,
      }));
    },
    [setState]
  );

  const shouldShowNudge = state.actionCount >= NUDGE_THRESHOLD;

  return {
    data: state.data,
    setData,
    actionCount: state.actionCount,
    shouldShowNudge,
  };
}

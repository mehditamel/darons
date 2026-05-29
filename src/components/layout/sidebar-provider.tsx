"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_COMPACT = "4rem";
export const SIDEBAR_COOKIE = "sidebar_compact";

interface SidebarContextValue {
  isCompact: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar doit être utilisé dans un SidebarProvider");
  }
  return ctx;
}

interface SidebarProviderProps {
  /** Initial value read from the cookie server-side — avoids any hydration flash. */
  initialCompact: boolean;
  children: ReactNode;
}

/**
 * Holds the sidebar compact state shared between the sidebar and the content
 * gutter. The width is exposed as the CSS variable `--sidebar-w` on a wrapper
 * element so the dashboard content can reflow (`lg:pl-[var(--sidebar-w)]`) in
 * sync with the sidebar — and the choice persists across reloads via a cookie.
 */
export function SidebarProvider({
  initialCompact,
  children,
}: SidebarProviderProps) {
  const [isCompact, setIsCompact] = useState(initialCompact);

  const toggle = useCallback(() => {
    setIsCompact((prev) => {
      const next = !prev;
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  const widthStyle = {
    "--sidebar-w": isCompact ? SIDEBAR_WIDTH_COMPACT : SIDEBAR_WIDTH,
  } as CSSProperties;

  return (
    <SidebarContext.Provider value={{ isCompact, toggle }}>
      <div style={widthStyle}>{children}</div>
    </SidebarContext.Provider>
  );
}

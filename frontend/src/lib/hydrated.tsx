"use client";

import { useState, useEffect } from "react";

let _appHydrated = false;
const listeners = new Set<() => void>();

function notify() {
  _appHydrated = true;
  listeners.forEach((fn) => fn());
}

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(_appHydrated);

  useEffect(() => {
    if (_appHydrated) {
      setHydrated(true);
    } else {
      listeners.add(() => setHydrated(true));
      return () => {
        listeners.delete(() => setHydrated(true));
      };
    }
  }, []);

  return hydrated;
}

// Call this in a root layout to mark hydration complete
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    notify();
    setReady(true);
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}

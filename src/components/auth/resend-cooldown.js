"use client";

import { useState, useEffect, useCallback } from "react";

export function useCooldown(initialSeconds = 60, storageKey = null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      const storedExpiry = localStorage.getItem(
        `loopwise_cooldown_${storageKey}`
      );
      if (storedExpiry) {
        const diff = Math.ceil(
          (parseInt(storedExpiry, 10) - Date.now()) / 1000
        );
        if (diff > 0) {
          setRemaining(diff);
        }
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (storageKey && typeof window !== "undefined") {
            localStorage.removeItem(`loopwise_cooldown_${storageKey}`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, storageKey]);

  const startCooldown = useCallback(
    (seconds = initialSeconds) => {
      setRemaining(seconds);
      if (storageKey && typeof window !== "undefined") {
        const expiry = Date.now() + seconds * 1000;
        localStorage.setItem(`loopwise_cooldown_${storageKey}`, String(expiry));
      }
    },
    [initialSeconds, storageKey]
  );

  const resetCooldown = useCallback(() => {
    setRemaining(0);
    if (storageKey && typeof window !== "undefined") {
      localStorage.removeItem(`loopwise_cooldown_${storageKey}`);
    }
  }, [storageKey]);

  return {
    remaining,
    isCoolingDown: remaining > 0,
    startCooldown,
    resetCooldown,
  };
}
